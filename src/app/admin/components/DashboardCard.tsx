"use client";
import React from 'react';
import Link from 'next/link';

interface OverviewProps {
  icon: React.ReactNode; 
  title: string;
  value: number | string;
  href?: string; // Optional link
};

const DashboardCard: React.FC<OverviewProps> = ({ icon, title, value, href }) => {
  const CardContent = () => (
    <div className="bg-white rounded-[10px] border border-[#c6e2f2] md:py-6 md:px-5 p-[15px] flex items-center gap-3 md:gap-5 hover:shadow-md transition-shadow duration-200">
      <div>
        <p className='h-[50px] w-[50px] md:h-[70px] md:w-[70px] rounded-full grid place-items-center border border-[#C7E4F4] bg-[#EEF7FC]'>
          {icon}
        </p>
      </div>
      <div>
        <p className='leading-normal font-gothamMedium'>{title}</p>
        <h3 className='md:text-[28px]'>{value}</h3>
      </div>
    </div>
  );

  // If href is provided, wrap in Link component
  if (href) {
    return (
      <Link href={href} className="block hover:cursor-pointer">
        <CardContent />
      </Link>
    );
  }

  // If no href, return just the card content
  return <CardContent />;
};

export default DashboardCard;