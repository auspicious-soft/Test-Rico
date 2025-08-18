import { Calendar, CreditCard, User, UserCheck, Users } from "lucide-react";

// Journey Timeline Component
interface JourneyItem {
  _id: string;
  userId: string;
  userType: string;
  message: string;
  date: string;
  type: 'session' | 'appointment' | 'assignment' | 'registration' | 'subscription' | 'onboarding';
  relatedUserId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  relatedUserType?: string;
  createdAt: string;
  updatedAt: string;
}

// Define the stage type
type StageType = 'session' | 'appointment' | 'assignment' | 'registration' | 'subscription' | 'onboarding';

interface ClientJourneyTimelineProps {
  journeyData?: JourneyItem[];
  className?: string;
  userType?: 'client' | 'therapist'; // Add userType prop
}

export const ClientJourneyTimeline = ({ 
  journeyData = [], 
  className = '',
  userType = 'client' // Default to client
}: ClientJourneyTimelineProps) => {
  
  // Define stages based on user type with proper typing
  const getStagesForUserType = (userType: 'client' | 'therapist') => {
    if (userType === 'therapist') {
      // For therapists: Registration -> Onboarding -> Assignment -> 1st Session
      return [
        { type: 'registration' as const, label: 'Sign Up', icon: User },
        { type: 'onboarding' as const, label: 'Onboarding', icon: Users },
        { type: 'assignment' as const, label: 'Assignment', icon: UserCheck },
        { type: 'session' as const, label: '1st Session', icon: Calendar }
      ];
    } else {
      // For clients: Registration -> Subscription -> Assignment -> 1st Session
      return [
        { type: 'registration' as const, label: 'Sign Up', icon: User },
        { type: 'subscription' as const, label: 'Subscription', icon: CreditCard },
        { type: 'assignment' as const, label: 'Assignment', icon: UserCheck },
        { type: 'session' as const, label: '1st Session', icon: Calendar }
      ];
    }
  };

  const allStages = getStagesForUserType(userType);

  // Create a map of completed stages with proper type checking
  const safeJourneyData = Array.isArray(journeyData) ? journeyData : [];
  const completedStages = new Set<StageType>(safeJourneyData.map(item => item.type));

  // Find the latest stage index
  const latestStageIndex = Math.max(
    ...allStages.map((stage, index) => 
      completedStages.has(stage.type) ? index : -1
    )
  );

  const getStageStatus = (index: number) => {
    if (index <= latestStageIndex && completedStages.has(allStages[index].type)) {
      return 'completed';
    } else if (index === latestStageIndex + 1) {
      return 'current';
    }
    return 'pending';
  };

  const getStageDate = (stageType: StageType) => {
    const journeyItem = safeJourneyData.find(item => item.type === stageType);
    if (journeyItem) {
      return new Date(journeyItem.date).toLocaleDateString();
    }
    return null;
  };

  const getRelatedUser = (stageType: StageType) => {
    const journeyItem = safeJourneyData.find(item => item.type === stageType);
    if (journeyItem?.relatedUserId) {
      return `${journeyItem.relatedUserId.firstName} ${journeyItem.relatedUserId.lastName}`;
    }
    return null;
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200">
          <div 
            className="h-full bg-[#283C63] transition-all duration-500 ease-in-out"
            style={{ 
              width: `${latestStageIndex >= 0 ? ((latestStageIndex + 1) / allStages.length) * 100 : 0}%` 
            }}
          />
        </div>

        {/* Stages */}
        <div className="relative flex justify-between">
          {allStages.map((stage, index) => {
            const status = getStageStatus(index);
            const StageIcon = stage.icon;
            const stageDate = getStageDate(stage.type);
            const relatedUser = getRelatedUser(stage.type);

            return (
              <div key={stage.type} className="flex flex-col items-center relative">
                {/* Icon Circle */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                  ${status === 'completed' 
                    ? 'bg-[#283C63] border-[#283C63] text-white' 
                    : status === 'current'
                    ? 'bg-white border-[#283C63] text-[#283C63]'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  <StageIcon size={20} />
                </div>

                {/* Label and Details */}
                <div className="mt-3 text-center min-w-0">
                  <div className={`
                    text-sm font-gothamMedium mb-1
                    ${status === 'completed' || status === 'current'
                      ? 'text-gray-900'
                      : 'text-gray-400'
                    }
                  `}>
                    {stage.label}
                  </div>
                  
                  {stageDate && (
                    <div className="text-xs text-gray-500 mb-1">
                      {stageDate}
                    </div>
                  )}
                  
                  {relatedUser && (
                    <div className="text-xs text-[#283C63] font-gothamMedium">
                      with {relatedUser}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};