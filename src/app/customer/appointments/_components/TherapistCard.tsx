import { Heart } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

interface TherapistCardProps {
  image: string;
  name: string;
  availability: string;
  timing: string;
  language: string;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ 
  image, 
  name, 
  availability, 
  timing, 
  language 
}) => {
  return (
    <div className="bg-transparent rounded-lg px-4 overflow-hidden relative">
      {/* Language indicator */}
      <span className='absolute top-3 right-3  bg-white rounded-lg p-1.5 shadow-sm text-xs font-medium'>
        {language || 'Eng'}
      </span>
      
      {/* Therapist image */}
      <div className="aspect-square relative">
        <Image 
          src={image} 
          alt={name}
          width={300}
          height={300}
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>
      
      {/* Card content */}
      <div className="py-4">
        <h3 className="font-semibold text-2xl text-[#283C63] mb-1">{name}</h3>
        <div className='flex justify-between'>
          <span className="text-sm text-[#283C63] mb-2">Specialty</span>
          <span className="text-sm text-[#283C63] mb-2">{availability}</span>
        </div>
        <div className='flex justify-between'>
          <span className="text-xs text-[#283C63]">Timings</span>
          <span className="text-xs text-[#283C63]">{timing}</span>
        </div>
      </div>
    </div>
  )
}

export default TherapistCard