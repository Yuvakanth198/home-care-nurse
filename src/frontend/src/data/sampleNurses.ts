export interface SampleNurse {
  id: string;
  name: string;
  experience: number;
  pincode: string;
  phone: string;
  bio: string;
  isAvailable: boolean;
  photoUrl: string;
  initials: string;
  registrationNumber: string;
  village?: string;
  mandal?: string;
  district?: string;
}

export const SAMPLE_NURSES: SampleNurse[] = [
  {
    id: "sample-1",
    name: "Priya Sharma",
    experience: 9,
    pincode: "532001",
    phone: "+91 98765 43210",
    bio: "Experienced nurse specializing in geriatric care and chronic disease management. Provides compassionate home visits for elderly patients across Srikakulam district.",
    isAvailable: true,
    photoUrl: "/assets/generated/nurse-priya.dim_400x400.jpg",
    initials: "PS",
    registrationNumber: "AP/RN/2015/04521",
    village: "Narasannapeta",
    mandal: "Narasannapeta",
    district: "Srikakulam",
  },
  {
    id: "sample-2",
    name: "Rajesh Kumar",
    experience: 12,
    pincode: "532001",
    phone: "+91 87654 32109",
    bio: "Skilled in post-operative wound care, IV therapy, and rehabilitation support. Trusted by hundreds of families across rural districts.",
    isAvailable: true,
    photoUrl: "/assets/generated/nurse-rajesh.dim_400x400.jpg",
    initials: "RK",
    registrationNumber: "AP/RN/2012/02108",
    village: "Amadalavalasa",
    mandal: "Amadalavalasa",
    district: "Srikakulam",
  },
  {
    id: "sample-3",
    name: "Anita Verma",
    experience: 7,
    pincode: "532201",
    phone: "+91 76543 21098",
    bio: "Dedicated to maternal and neonatal health, antenatal care, and immunization. Committed to reducing infant mortality in underserved communities.",
    isAvailable: true,
    photoUrl: "/assets/generated/nurse-anita.dim_400x400.jpg",
    initials: "AV",
    registrationNumber: "AP/RN/2017/03312",
    village: "Palakonda",
    mandal: "Palakonda",
    district: "Srikakulam",
  },
  {
    id: "sample-4",
    name: "Sunita Patel",
    experience: 15,
    pincode: "532401",
    phone: "+91 65432 10987",
    bio: "Specialized in diabetic foot care, insulin management, and blood pressure monitoring. Brings clinical expertise directly to patients' homes.",
    isAvailable: false,
    photoUrl: "",
    initials: "SP",
    registrationNumber: "AP/RN/2009/01205",
    village: "Tekkali",
    mandal: "Tekkali",
    district: "Srikakulam",
  },
  {
    id: "sample-5",
    name: "Mohan Singh",
    experience: 10,
    pincode: "532421",
    phone: "+91 54321 09876",
    bio: "Compassionate care for patients with serious illness, focusing on comfort, dignity, and quality of life during difficult times.",
    isAvailable: true,
    photoUrl: "",
    initials: "MS",
    registrationNumber: "AP/RN/2014/03087",
    village: "Kaviti",
    mandal: "Kaviti",
    district: "Srikakulam",
  },
  {
    id: "sample-6",
    name: "Kavita Rao",
    experience: 6,
    pincode: "532440",
    phone: "+91 43210 98765",
    bio: "Provides physiotherapy-assisted care and mobility support for stroke recovery, orthopaedic patients, and accident victims in rural areas.",
    isAvailable: true,
    photoUrl: "",
    initials: "KR",
    registrationNumber: "AP/RN/2018/05641",
    village: "Rajam",
    mandal: "Rajam",
    district: "Srikakulam",
  },
];

export const SAMPLE_FEEDBACK = [
  {
    id: "fb-1",
    patientName: "Ramesh Gupta",
    rating: 5,
    reviewText:
      "Nurse Priya was incredibly kind and professional. She visited my mother daily and made her recovery so much smoother. Highly recommend!",
    initials: "RG",
  },
  {
    id: "fb-2",
    patientName: "Lata Mishra",
    rating: 5,
    reviewText:
      "Rajesh sir took care of my husband post-surgery for three weeks. His expertise and gentle approach helped our family through a very difficult time.",
    initials: "LM",
  },
  {
    id: "fb-3",
    patientName: "Dinesh Tiwari",
    rating: 4,
    reviewText:
      "Very professional service. The nurse arrived on time and handled the wound dressing with great care. Easy to contact through the app.",
    initials: "DT",
  },
  {
    id: "fb-4",
    patientName: "Sarla Devi",
    rating: 5,
    reviewText:
      "As a senior citizen living alone, having a trusted nurse visit me was a blessing. She is prompt, caring, and very knowledgeable.",
    initials: "SD",
  },
];
