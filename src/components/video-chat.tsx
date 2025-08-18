import React, { useState, useEffect, useRef } from 'react';
import { MeetingProvider, useMeeting, useParticipant, usePubSub } from '@videosdk.live/react-sdk';
import dynamic from 'next/dynamic';
import { createVideoSDKMeeting } from '@/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { getProfileService } from '@/services/client/client-service';
import { FaMicrophoneLinesSlash, FaMicrophoneLines } from 'react-icons/fa6';
import { BiSolidCameraOff } from 'react-icons/bi';
import { ImCamera } from 'react-icons/im';
import { Participant } from '@videosdk.live/react-sdk/dist/types/participant';
import { updateAppointmentData } from '@/services/admin/admin-service';
import { getTherapistsProfileData } from '@/services/therapist/therapist-service.';


// Function to add session time to backend
const addSessionTime = async (appointmentId: string, userType: 'therapist' | 'client', duration: number) => {
  try {
    const payload = {
      appointmentId,
      userType,
      duration,
    };
    // console.log('payload: ', payload);
    // const response = await updateAppointmentData('/record-session-time', payload);
    // console.log('response: ', response);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/record-session-time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointmentId,
        userType,
        duration,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to record session time');
    }
    console.log(`Recorded ${duration}s for ${userType}`);
  } catch (error) {
    console.error('Error recording session time:', error);
    toast.error('Failed to record session time');
  }
};

// Dynamically import ReactPlayer with error handling
const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-gray-200 animate-pulse rounded"></div>,
});

interface MeetingHookResult {
  join: () => void;
  participants: Map<string, Participant>;
  leave: () => void;
  localParticipant: Participant;
}

// Error Boundary Component
class VideoErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Video component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-48 bg-red-100 border border-red-300 rounded p-4">
          <p className="text-red-600">Video component failed to load</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Participant View Component
const ParticipantView = ({ participantId, userType }: { participantId: string; userType: 'therapist' | 'client' }) => {
  const micRef = React.useRef<HTMLAudioElement>(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName, setQuality } = useParticipant(participantId);
  const [videoError, setVideoError] = useState(false);

  const videoStream = React.useMemo(() => {
    if (webcamOn && webcamStream) {
      try {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);
        return mediaStream;
      } catch (error) {
        console.error('Error creating video stream:', error);
        setVideoError(true);
        return null;
      }
    }
    return null;
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      try {
        if (micOn && micStream) {
          const mediaStream = new MediaStream();
          mediaStream.addTrack(micStream.track);
          micRef.current.srcObject = mediaStream;
          micRef.current.play().catch((err) => console.error('Audio play failed', err));
        } else {
          micRef.current.srcObject = null;
        }
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    }

    try {
      setQuality('high');
    } catch (error) {
      console.error('Error setting quality:', error);
    }
  }, [micStream, micOn, setQuality]);

  return (
    <div className="w-full">
      <p className="font-bold text-[16px]">{displayName || 'Participant'}</p>
      <audio ref={micRef} autoPlay muted={isLocal} />
      {webcamOn && !videoError ? (
        <VideoErrorBoundary>
          <div
            className="p-[1px] rounded-lg min-h-[200px]"
            style={isLocal ? { transform: 'scaleX(-1)', WebkitTransform: 'scaleX(-1)' } : {}}
          >
            {videoStream ? (
              <ReactPlayer
                playsinline
                url={videoStream}
                playing
                muted
                height="100%"
                width="100%"
                onError={() => setVideoError(true)}
              />
            ) : (
              <div className="w-full h-48 bg-gray-300 rounded flex items-center justify-center">
                <p>Loading video...</p>
              </div>
            )}
          </div>
          <span className="flex items-center justify-center mt-2">
            Webcam: {webcamOn ? <ImCamera className="ml-2" /> : <BiSolidCameraOff className="ml-2" />}
            &nbsp;| &nbsp;
            Mic: {micOn ? <FaMicrophoneLines className="ml-2" /> : <FaMicrophoneLinesSlash className="ml-2" />}
          </span>
        </VideoErrorBoundary>
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded flex flex-col items-center justify-center">
          <BiSolidCameraOff className="text-4xl text-gray-500 mb-2" />
          <p className="font-bold text-[20px] text-gray-600">{videoError ? 'Video Error' : 'Webcam Disabled'}</p>
          {videoError && (
            <button
              onClick={() => setVideoError(false)}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Retry Video
            </button>
          )}
          <span className="flex items-center justify-center mt-4">
            Mic: {micOn ? <FaMicrophoneLines className="ml-2" /> : <FaMicrophoneLinesSlash className="ml-2" />}
          </span>
        </div>
      )}
    </div>
  );
};

// Controls Component
const Controls = ({ onLeave, appointmentId, userType, callDuration }: { onLeave: () => void; appointmentId: string; userType: 'therapist' | 'client'; callDuration: number }) => {
  const { leave, toggleMic, toggleWebcam } = useMeeting();
  const router = useRouter();

  const handleLeave = () => {
    try {
      onLeave();
      leave();
      router.back();
    } catch (error) {
      console.error('Error leaving meeting:', error);
      router.back();
    }
  };

  const handleToggleMic = () => {
    try {
      toggleMic();
    } catch (error) {
      console.error('Error toggling mic:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const handleToggleWebcam = () => {
    try {
      toggleWebcam();
    } catch (error) {
      console.error('Error toggling webcam:', error);
      toast.error('Failed to toggle camera');
    }
  };

  return (
    <div className="flex justify-center items-center gap-x-2 p-4 bg-white rounded-lg shadow mb-4">
      <button
        onClick={handleToggleMic}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Toggle Mic
      </button>
      <button
        onClick={handleToggleWebcam}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Toggle Camera
      </button>
      <button
        onClick={handleLeave}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-auto transition-colors"
      >
        Leave Session
      </button>
    </div>
  );
};

// MeetingView Component
const MeetingView = ({ meetingId, userType, token, appointmentId }: { meetingId: string; userType: 'therapist' | 'client'; token: string; appointmentId: string }) => {
  const router = useRouter();
  const [joined, setJoined] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [uniqueParticipantCount, setUniqueParticipantCount] = useState(0);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [participantNames, setParticipantNames] = useState<Set<string>>(new Set());
  const [sessionEnded, setSessionEnded] = useState(false);

  const { join, participants, leave, localParticipant } = useMeeting({
    onMeetingJoined: () => {
      setJoined(true);
      console.log(`${userType} ${appointmentId} (${localParticipant?.displayName}) joined the meeting`);
      setSessionEnded(false);
      setTimeout(() => updateUniqueParticipants(), 1000);
    },
    onMeetingLeft: () => {
      setJoined(false);
      handleSessionEnd();
    },
    onParticipantJoined: (participant) => {
      console.log(`Participant joined:`, participant.displayName, participant.id);
      setTimeout(() => updateUniqueParticipants(), 1000);
    },
    onParticipantLeft: (participant) => {
      console.log(`Participant left:`, participant.displayName, participant.id);
      setTimeout(() => updateUniqueParticipants(), 1000);
    },
  });

  const { publish } = usePubSub('SESSION_STATE', {
    onMessageReceived: (message) => {
      const msg = message.message;
      if (msg.startsWith('SESSION_START:')) {
        const startTime = parseInt(msg.split(':')[1]);
        if (!sessionStartTime) {
          setSessionStartTime(startTime);
          sessionStorage.setItem('meetingStartTime', startTime.toString());
        }
      } else if (msg === 'REQUEST_SESSION_STATE') {
        if (sessionStartTime) {
          publish(`SESSION_START:${sessionStartTime}`, { persist: true });
        }
      }
    },
  });

  const updateUniqueParticipants = () => {
    const names = new Set<string>();
    console.log('🔍 Updating participants...');
    console.log('Local participant:', localParticipant);
    console.log('Remote participants:', Array.from(participants.entries()));

    if (localParticipant?.displayName) {
      const cleanName = localParticipant.displayName.trim();
      if (cleanName) {
        names.add(cleanName);
        console.log('Added local participant:', cleanName);
      }
    }

    Array.from(participants.values()).forEach((participant) => {
      if (participant.displayName) {
        const cleanName = participant.displayName.trim();
        if (cleanName) {
          names.add(cleanName);
          console.log('Added remote participant:', cleanName);
        }
      }
    });

    setParticipantNames(names);
    const uniqueCount = names.size;
    setUniqueParticipantCount(uniqueCount);

    console.log('✅ Final unique participants:', Array.from(names), 'Count:', uniqueCount);

    if (uniqueCount === 2 && !sessionStartTime) {
      const startTime = Date.now();
      setSessionStartTime(startTime);
      publish(`SESSION_START:${startTime}`, { persist: true });
      sessionStorage.setItem('meetingStartTime', startTime.toString());
      console.log('🎬 Session started with 2 unique participants:', Array.from(names));
    }
  };

  const handleSessionEnd = () => {
    if (sessionStartTime && !sessionEnded) {
      const endTime = Date.now();
      const durationInSeconds = Math.floor((endTime - sessionStartTime) / 1000);
      console.log('🏁 Session ended. Total duration for', userType, ':', durationInSeconds, 'seconds');
      addSessionTime(appointmentId, userType, durationInSeconds);
      setSessionEnded(true);
      sessionStorage.removeItem('meetingStartTime');
      setSessionStartTime(null);
    }
  };

  const handleLeave = () => {
    handleSessionEnd();
  };

  useEffect(() => {
    if (joined && localParticipant) {
      console.log('👥 Participants or local participant changed, updating...');
      const timer = setTimeout(() => {
        updateUniqueParticipants();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [participants, localParticipant, joined]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      handleSessionEnd();
      leave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [leave, sessionStartTime]);

  useEffect(() => {
    if (token && meetingId && !hasJoined) {
      setTimeout(() => {
        join();
        setHasJoined(true);
      }, 100);
    }
  }, [meetingId, token, hasJoined, join]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (sessionStartTime) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const durationInSeconds = Math.floor((currentTime - sessionStartTime) / 1000);
        setCallDuration(durationInSeconds);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionStartTime]);

  useEffect(() => {
    const storedStartTime = sessionStorage.getItem('meetingStartTime');
    if (storedStartTime && !sessionStartTime) {
      const startTime = parseInt(storedStartTime);
      setSessionStartTime(startTime);
    } else if (!sessionStartTime) {
      publish('REQUEST_SESSION_STATE', { persist: true });
    }
  }, []);

  useEffect(() => {
    console.log('State Update - sessionStartTime:', sessionStartTime, 'uniqueParticipantCount:', uniqueParticipantCount, 'callDuration:', callDuration);
  }, [sessionStartTime, uniqueParticipantCount, callDuration]);

  return (
    <div className="w-full">
      <h3>Meeting ID: {meetingId}</h3>
      {joined ? (
        <div className="w-full">
          <Controls onLeave={handleLeave} appointmentId={appointmentId} userType={userType} callDuration={callDuration} />
          <div className="w-full sm:flex gap-8 space-between">
            {[...participants.keys()].map((participantId) => (
              <div key={participantId}>
                <ParticipantView participantId={participantId} userType={userType} />
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            {/* <p className="text-lg font-semibold">Unique Participants: {uniqueParticipantCount}</p> */}
            
            {sessionStartTime && (
              <p className="text-green-600 font-bold text-xl">
                ⏱️ Session Duration: {formatDuration(callDuration)}
              </p>
            )}
            
            {uniqueParticipantCount === 1 && !sessionStartTime && !sessionEnded && (
              <p className="text-yellow-600 font-semibold">
                ⏳ Waiting for the other participant to join...
                <br />
                <span className="text-sm text-gray-500">Timer will start when both participants are present</span>
              </p>
            )}
            
            {sessionEnded && sessionStorage.getItem('meetingDurationTime') && (
              <p className="text-red-600 font-semibold">
                ✅ Session Ended. Total Duration: {formatDuration(parseInt(sessionStorage.getItem('meetingDurationTime') || '0'))}
              </p>
            )}
            
            {/* <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-left">
              <p><strong>Debug Info:</strong></p>
              <p>- Participants Map Size: {participants.size}</p>
              <p>- Local Participant: {localParticipant?.displayName || 'None'}</p>
              <p>- Local Participant ID: {localParticipant?.id || 'None'}</p>
              <p>- Unique Names: [{Array.from(participantNames).join(', ')}]</p>
              <p>- Session Start: {sessionStartTime ? new Date(sessionStartTime).toLocaleTimeString() : 'None'}</p>
              <p>- Session Ended: {sessionEnded ? 'Yes' : 'No'}</p>
              <p>- Call Duration: {callDuration}s</p>
              <p>- Joined: {joined ? 'Yes' : 'No'}</p>
              <p>- Stored Start Time: {sessionStorage.getItem('meetingStartTime') || 'None'}</p>
            </div> */}
          </div>
        </div>
      ) : (
        <p>Joining the meeting...</p>
      )}
    </div>
  );
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ClientSideVideoChat Component
const ClientSideVideoChat = ({ appointmentId, userType, userId }: { appointmentId: string; userType: 'therapist' | 'client'; userId: string }) => {
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const { data, error: therapistError } = useSWR(
    userType === 'therapist' ? `/therapist/${userId}` : null,
    getTherapistsProfileData,
    { onError: (err) => console.error('Therapist data fetch error:', err) }
  );
  const therapistName = data?.data?.data?.firstName + ' ' + data?.data?.data?.lastName;

  const { data: client, error: clientError } = useSWR(
    userType === 'client' ? `/client/${userId}` : null,
    getProfileService,
    { onError: (err) => console.error('Client data fetch error:', err) }
  );
  const clientName = client?.data?.data?.firstName + ' ' + client?.data?.data?.lastName;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initializeMeeting = async () => {
    try {
      setInitError(null);
      const { roomId, token }: any = await createVideoSDKMeeting(appointmentId, userId);
      setMeetingId(roomId);
      setToken(token);
    } catch (error: any) {
      console.error('Failed to initialize meeting:', error);
      setInitError(error.message || 'Failed to initialize meeting');
      toast.error('Failed to initialize meeting. Please refresh and try again.');
    }
  };

  useEffect(() => {
    if (!isClient) return;
    initializeMeeting();
  }, [appointmentId, userId, isClient]);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error initializing video chat:</p>
        <p>{initError}</p>
        <button
          onClick={initializeMeeting}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!meetingId || !token) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p>Initializing meeting...</p>
      </div>
    );
  }

  const displayName = userType === 'therapist' ? therapistName : clientName;

  return (
    <VideoErrorBoundary>
      <MeetingProvider
        config={{
          meetingId,
          micEnabled: true,
          webcamEnabled: true,
          name: displayName || `${userType}`,
          debugMode: process.env.NODE_ENV === 'development',
          defaultCamera: 'front',
        }}
        token={token}
      >
        <MeetingView meetingId={meetingId} userType={userType} token={token} appointmentId={appointmentId} />
      </MeetingProvider>
    </VideoErrorBoundary>
  );
};

// Main Exported Component
export const VideoChatPage = ({ appointmentId, userType, userId }: { appointmentId: string; userType: 'therapist' | 'client'; userId: string }) => {
  return (
    <div className="max-w-6xl mx-auto ">
      <ClientSideVideoChat appointmentId={appointmentId} userType={userType} userId={userId} />
    </div>
  );
};