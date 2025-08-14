"use client";
import React, { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { ButtonArrow } from "@/utils/svgicons";
import Image from 'next/image';
import success from "@/assets/images/succes.png";
import Notification from "../components/Notification";
import { toast } from "sonner";
import { AddNewTherapist } from "@/services/admin/admin-service";

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

const Page = () => {
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // US phone number validation regex
  const isValidUSPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };

  // Format phone number as XXX-XXX-XXXX
  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, ""); // Remove non-digits
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "phoneNumber") {
      // Limit input to digits, dashes, and max length
      const cleaned = value.replace(/\D/g, "").slice(0, 10); // Only digits, max 10
      newValue = formatPhoneNumber(cleaned);

      // Validate phone number
      if (!isValidUSPhoneNumber(newValue) && newValue !== "") {
        setPhoneError("Please enter a valid US phone number (e.g., 123-456-7890)");
      } else {
        setPhoneError(null);
      }
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  // Restrict input to valid phone number characters
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    // Allow digits, backspace, and navigation keys
    if (!/[0-9]/.test(char) && char !== "Backspace" && char !== "Tab" && char !== "ArrowLeft" && char !== "ArrowRight") {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Final validation before submission
    if (!isValidUSPhoneNumber(formData.phoneNumber)) {
      setPhoneError("Please enter a valid US phone number");
      toast.error("Invalid phone number");
      return;
    }

    startTransition(async () => {
      try {
        const response = await AddNewTherapist('/admin/therapists', {
          ...formData,
          phoneNumber: formData.phoneNumber.replace(/[-. ()]/g, ""), // Clean phone number for submission
        });
        if (response?.status === 201) {
          setNotification("Therapist Added Successfully");
          setFormData({
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            password: "",
          });
          setPhoneError(null);
        } else {
          toast.error("Failed to add wellness entry");
        }
      } catch (error) {
        console.error("Error adding wellness entry:", error);
        toast.error("An error occurred while adding the wellness entry");
      }
    });
  };

  return (
    <>
      <h1 className="font-antic text-[#283C63] text-[30px] leading-[1.2em] mb-[25px] lg:text-[40px] lg:mb-[50px]">
        Add New Clinician
      </h1>
      <div className="bg-white rounded-[10px] w-full p-5">
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-3 gap-[30px]">
            <div>
              <label className="block mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                placeholder="John"
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Mobile Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="123-456-7890"
                maxLength={12} // Max length for XXX-XXX-XXXX
                required
                className={`w-full p-2 border rounded ${phoneError ? 'border-red-500' : ''}`}
              />
              {/* {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>} */}
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="emailaddress@mail.com"
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="******"
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="mt-[30px] flex justify-end">
            <button
              type="submit"
              className="button px-[30px] flex items-center gap-2"
              disabled={isPending || !!phoneError}
            >
              {isPending ? 'Submitting...' : 'Submit'} <ButtonArrow />
            </button>
          </div>
        </form>
        <Notification message={notification} onClose={() => setNotification(null)} />
      </div>
    </>
  );
};

export default Page;