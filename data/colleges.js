const colleges = [
  // ==========================================
  // 1. Karnataka (6 Institutions)
  // ==========================================
  {
    collegeId: 'col-jss',
    name: 'JSS College of Pharmacy, Mysuru',
    code: 'JSS-MYS',
    slug: 'jss-college-of-pharmacy-mysuru',
    region: 'Karnataka',
    state: 'Karnataka',
    status: 'ACTIVE',
    programs: ['PHARM_D', 'PHARM_D_PB'],
    seatQuota: { maxTeachers: 65, maxStudents: 920, usedTeachers: 48, usedStudents: 720 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-manipal',
    name: 'Manipal College of Pharmaceutical Sciences (MCOPS), Manipal',
    code: 'MCOPS-MAN',
    slug: 'mcops-manipal',
    region: 'Karnataka',
    state: 'Karnataka',
    status: 'ACTIVE',
    programs: ['PHARM_D', 'PHARM_D_PB'],
    seatQuota: { maxTeachers: 60, maxStudents: 850, usedTeachers: 42, usedStudents: 640 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-acharya',
    name: 'Acharya & B.M. Reddy College of Pharmacy, Bangalore',
    code: 'ABMRCP-BLR',
    slug: 'acharya-bm-reddy-college-of-pharmacy-bangalore',
    region: 'Karnataka',
    state: 'Karnataka',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 50, maxStudents: 600, usedTeachers: 35, usedStudents: 480 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-al-ameen',
    name: 'Al-Ameen College of Pharmacy, Bangalore',
    code: 'AACP-BLR',
    slug: 'al-ameen-college-of-pharmacy-bangalore',
    region: 'Karnataka',
    state: 'Karnataka',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 45, maxStudents: 550, usedTeachers: 30, usedStudents: 410 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-ngsm',
    name: 'NGSM Institute of Pharmaceutical Sciences, Mangalore',
    code: 'NGSMIPS-MNG',
    slug: 'ngsm-institute-of-pharmaceutical-sciences-mangalore',
    region: 'Karnataka',
    state: 'Karnataka',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 45, maxStudents: 500, usedTeachers: 28, usedStudents: 380 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-krupanidhi',
    name: 'Krupanidhi College of Pharmacy, Bangalore',
    code: 'KCP-BLR',
    slug: 'krupanidhi-college-of-pharmacy-bangalore',
    region: 'Karnataka',
    state: 'Karnataka',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 45, maxStudents: 500, usedTeachers: 26, usedStudents: 360 },
    validUntil: '2028-12-31'
  },

  // ==========================================
  // 2. Tamil Nadu (4 Institutions)
  // ==========================================
  {
    collegeId: 'col-srm',
    name: 'SRM Institute of Science and Technology, Chennai',
    code: 'SRM-CHN',
    slug: 'srm-institute-of-science-and-technology-chennai',
    region: 'Tamil Nadu',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    programs: ['PHARM_D', 'PHARM_D_PB'],
    seatQuota: { maxTeachers: 55, maxStudents: 700, usedTeachers: 38, usedStudents: 520 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-psg',
    name: 'PSG College of Pharmacy, Coimbatore',
    code: 'PSGCP-CBE',
    slug: 'psg-college-of-pharmacy-coimbatore',
    region: 'Tamil Nadu',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 45, maxStudents: 550, usedTeachers: 32, usedStudents: 430 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-mmc',
    name: 'Madras Medical College (MMC), Chennai',
    code: 'MMC-CHN',
    slug: 'madras-medical-college-mmc-chennai',
    region: 'Tamil Nadu',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 50, maxStudents: 600, usedTeachers: 36, usedStudents: 490 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-sri-ramachandra',
    name: 'Sri Ramachandra Institute of Higher Education and Research, Chennai',
    code: 'SRIHER-CHN',
    slug: 'sri-ramachandra-institute-of-higher-education-and-research-chennai',
    region: 'Tamil Nadu',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    programs: ['PHARM_D', 'PHARM_D_PB'],
    seatQuota: { maxTeachers: 55, maxStudents: 750, usedTeachers: 40, usedStudents: 560 },
    validUntil: '2028-12-31'
  },

  // ==========================================
  // 3. Andhra Pradesh & Telangana (5 Institutions)
  // ==========================================
  {
    collegeId: 'col-andhra-univ',
    name: 'Andhra University College of Pharmaceutical Sciences, Visakhapatnam',
    code: 'AUCPS-VIZ',
    slug: 'andhra-university-college-of-pharmaceutical-sciences-visakhapatnam',
    region: 'Andhra Pradesh & Telangana',
    state: 'Andhra Pradesh',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 50, maxStudents: 600, usedTeachers: 34, usedStudents: 470 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-niper',
    name: 'National Institute of Pharmaceutical Education and Research (NIPER), Hyderabad',
    code: 'NIPER-HYD',
    slug: 'niper-hyderabad',
    region: 'Andhra Pradesh & Telangana',
    state: 'Telangana',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 50, maxStudents: 500, usedTeachers: 35, usedStudents: 390 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-vignan',
    name: 'Vignan Institute of Pharmaceutical Technology, Visakhapatnam',
    code: 'VIPT-VIZ',
    slug: 'vignan-institute-of-pharmaceutical-technology-visakhapatnam',
    region: 'Andhra Pradesh & Telangana',
    state: 'Andhra Pradesh',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 45, maxStudents: 550, usedTeachers: 28, usedStudents: 410 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-riper',
    name: 'Raghavendra Institute of Pharmaceutical Education and Research (RIPER), Anantapur',
    code: 'RIPER-ATP',
    slug: 'riper-anantapur',
    region: 'Andhra Pradesh & Telangana',
    state: 'Andhra Pradesh',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 45, maxStudents: 550, usedTeachers: 30, usedStudents: 420 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-svims',
    name: 'Sri Venkateswara Institute of Medical Sciences (SVIMS), Tirupati',
    code: 'SVIMS-TPT',
    slug: 'svims-tirupati',
    region: 'Andhra Pradesh & Telangana',
    state: 'Andhra Pradesh',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 45, maxStudents: 500, usedTeachers: 29, usedStudents: 390 },
    validUntil: '2028-12-31'
  },

  // ==========================================
  // 4. Kerala (3 Institutions)
  // ==========================================
  {
    collegeId: 'col-amrita',
    name: 'Amrita School of Pharmacy, Kochi',
    code: 'ASP-KOC',
    slug: 'amrita-school-of-pharmacy-kochi',
    region: 'Kerala',
    state: 'Kerala',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 45, maxStudents: 550, usedTeachers: 31, usedStudents: 430 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-ncp',
    name: 'National College of Pharmacy, Kozhikode',
    code: 'NCP-CLT',
    slug: 'national-college-of-pharmacy-kozhikode',
    region: 'Kerala',
    state: 'Kerala',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 40, maxStudents: 480, usedTeachers: 25, usedStudents: 350 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-nehru',
    name: 'Nehru College of Pharmacy, Thiruvilwamala',
    code: 'NCP-TWM',
    slug: 'nehru-college-of-pharmacy-thiruvilwamala',
    region: 'Kerala',
    state: 'Kerala',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 40, maxStudents: 480, usedTeachers: 24, usedStudents: 340 },
    validUntil: '2028-12-31'
  },

  // ==========================================
  // 5. Maharashtra & Gujarat (4 Institutions)
  // ==========================================
  {
    collegeId: 'col-poona',
    name: 'Poona College of Pharmacy (Bharati Vidyapeeth), Pune',
    code: 'PCP-PUN',
    slug: 'poona-college-of-pharmacy-bharati-vidyapeeth-pune',
    region: 'Maharashtra & Gujarat',
    state: 'Maharashtra',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 50, maxStudents: 600, usedTeachers: 35, usedStudents: 490 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-bombay',
    name: 'Bombay College of Pharmacy, Mumbai',
    code: 'BCP-MUM',
    slug: 'bombay-college-of-pharmacy-mumbai',
    region: 'Maharashtra & Gujarat',
    state: 'Maharashtra',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 50, maxStudents: 600, usedTeachers: 38, usedStudents: 510 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-nmims',
    name: 'NMIMS School of Pharmacy & Technology Management, Mumbai',
    code: 'NMIMS-MUM',
    slug: 'nmims-school-of-pharmacy-technology-management-mumbai',
    region: 'Maharashtra & Gujarat',
    state: 'Maharashtra',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 55, maxStudents: 650, usedTeachers: 40, usedStudents: 540 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-lmcp',
    name: 'L. M. College of Pharmacy, Ahmedabad',
    code: 'LMCP-AHM',
    slug: 'lm-college-of-pharmacy-ahmedabad',
    region: 'Maharashtra & Gujarat',
    state: 'Gujarat',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 45, maxStudents: 550, usedTeachers: 32, usedStudents: 440 },
    validUntil: '2028-12-31'
  },

  // ==========================================
  // 6. Northern & Central India (5 Institutions)
  // ==========================================
  {
    collegeId: 'col-niper-mohali',
    name: 'NIPER Mohali, Mohali, Punjab',
    code: 'NIPER-MOH',
    slug: 'niper-mohali',
    region: 'Northern & Central India',
    state: 'Punjab',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 50, maxStudents: 500, usedTeachers: 36, usedStudents: 410 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-lpu',
    name: 'Lovely Professional University (LPU), Phagwara, Punjab',
    code: 'LPU-PB',
    slug: 'lovely-professional-university-lpu-phagwara',
    region: 'Northern & Central India',
    state: 'Punjab',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 55, maxStudents: 750, usedTeachers: 42, usedStudents: 620 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-chitkara',
    name: 'Chitkara University, Rajpura, Punjab',
    code: 'CU-RAJ',
    slug: 'chitkara-university-rajpura',
    region: 'Northern & Central India',
    state: 'Punjab',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 50, maxStudents: 650, usedTeachers: 35, usedStudents: 510 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-isf',
    name: 'ISF College of Pharmacy, Moga, Punjab',
    code: 'ISFCP-MOG',
    slug: 'isf-college-of-pharmacy-moga',
    region: 'Northern & Central India',
    state: 'Punjab',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 45, maxStudents: 550, usedTeachers: 31, usedStudents: 430 },
    validUntil: '2028-12-31'
  },
  {
    collegeId: 'col-shoolini',
    name: 'Shoolini University, Solan, Himachal Pradesh',
    code: 'SHOOLINI-HP',
    slug: 'shoolini-university-solan',
    region: 'Northern & Central India',
    state: 'Himachal Pradesh',
    status: 'ACTIVE',
    programs: ['PHARM_D'],
    seatQuota: { maxTeachers: 45, maxStudents: 500, usedTeachers: 28, usedStudents: 380 },
    validUntil: '2028-12-31'
  }
];

module.exports = colleges;
