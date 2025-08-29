export interface Language {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  enabled: boolean;
}

export interface Translation {
  [key: string]: {
    [languageId: string]: string;
  };
}

export const supportedLanguages: Language[] = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    enabled: true
  },
  {
    id: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    enabled: true
  },
  {
    id: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    direction: 'ltr',
    enabled: true
  },
  {
    id: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    enabled: false
  },
  {
    id: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    enabled: false
  },
  {
    id: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    enabled: false
  },
  {
    id: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    enabled: false
  },
  {
    id: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    enabled: false
  }
];

export const translations: Translation = {
  // Navigation
  'nav.home': {
    'en': 'Home',
    'es': 'Inicio',
    'zh': '首页'
  },
  'nav.clinical_trials': {
    'en': 'Clinical Trials',
    'es': 'Ensayos Clínicos',
    'zh': '临床试验'
  },
  'nav.agent_platform': {
    'en': 'Agent Platform',
    'es': 'Plataforma de Agentes',
    'zh': '代理平台'
  },
  'nav.decentralized': {
    'en': 'Decentralized',
    'es': 'Descentralizado',
    'zh': '去中心化'
  },
  'nav.resources': {
    'en': 'Resources',
    'es': 'Recursos',
    'zh': '资源'
  },

  // Common Actions
  'action.search': {
    'en': 'Search',
    'es': 'Buscar',
    'zh': '搜索'
  },
  'action.submit': {
    'en': 'Submit',
    'es': 'Enviar',
    'zh': '提交'
  },
  'action.cancel': {
    'en': 'Cancel',
    'es': 'Cancelar',
    'zh': '取消'
  },
  'action.save': {
    'en': 'Save',
    'es': 'Guardar',
    'zh': '保存'
  },
  'action.delete': {
    'en': 'Delete',
    'es': 'Eliminar',
    'zh': '删除'
  },
  'action.edit': {
    'en': 'Edit',
    'es': 'Editar',
    'zh': '编辑'
  },
  'action.view': {
    'en': 'View',
    'es': 'Ver',
    'zh': '查看'
  },

  // Medical Terms
  'medical.diabetes': {
    'en': 'Diabetes',
    'es': 'Diabetes',
    'zh': '糖尿病'
  },
  'medical.diabetes_type_1': {
    'en': 'Type 1 Diabetes',
    'es': 'Diabetes Tipo 1',
    'zh': '1型糖尿病'
  },
  'medical.diabetes_type_2': {
    'en': 'Type 2 Diabetes',
    'es': 'Diabetes Tipo 2',
    'zh': '2型糖尿病'
  },
  'medical.cancer': {
    'en': 'Cancer',
    'es': 'Cáncer',
    'zh': '癌症'
  },
  'medical.breast_cancer': {
    'en': 'Breast Cancer',
    'es': 'Cáncer de Mama',
    'zh': '乳腺癌'
  },
  'medical.heart_disease': {
    'en': 'Heart Disease',
    'es': 'Enfermedad Cardíaca',
    'zh': '心脏病'
  },
  'medical.asthma': {
    'en': 'Asthma',
    'es': 'Asma',
    'zh': '哮喘'
  },
  'medical.autoimmune': {
    'en': 'Autoimmune Disorder',
    'es': 'Trastorno Autoinmune',
    'zh': '自身免疫性疾病'
  },

  // Trial Related
  'trial.search': {
    'en': 'Search Trials',
    'es': 'Buscar Ensayos',
    'zh': '搜索试验'
  },
  'trial.eligibility': {
    'en': 'Eligibility',
    'es': 'Elegibilidad',
    'zh': '资格'
  },
  'trial.enrollment': {
    'en': 'Enrollment',
    'es': 'Inscripción',
    'zh': '注册'
  },
  'trial.status': {
    'en': 'Status',
    'es': 'Estado',
    'zh': '状态'
  },
  'trial.location': {
    'en': 'Location',
    'es': 'Ubicación',
    'zh': '位置'
  },
  'trial.duration': {
    'en': 'Duration',
    'es': 'Duración',
    'zh': '持续时间'
  },
  'trial.compensation': {
    'en': 'Compensation',
    'es': 'Compensación',
    'zh': '补偿'
  },

  // Privacy & Security
  'privacy.data_protection': {
    'en': 'Data Protection',
    'es': 'Protección de Datos',
    'zh': '数据保护'
  },
  'privacy.encryption': {
    'en': 'Encryption',
    'es': 'Cifrado',
    'zh': '加密'
  },
  'privacy.consent': {
    'en': 'Consent',
    'es': 'Consentimiento',
    'zh': '同意'
  },
  'privacy.zero_knowledge': {
    'en': 'Zero-Knowledge Proofs',
    'es': 'Pruebas de Conocimiento Cero',
    'zh': '零知识证明'
  },
  'privacy.blockchain': {
    'en': 'Blockchain Security',
    'es': 'Seguridad Blockchain',
    'zh': '区块链安全'
  },

  // AI & Technology
  'ai.agent': {
    'en': 'AI Agent',
    'es': 'Agente de IA',
    'zh': 'AI代理'
  },
  'ai.matching': {
    'en': 'AI Matching',
    'es': 'Coincidencia de IA',
    'zh': 'AI匹配'
  },
  'ai.learning': {
    'en': 'Machine Learning',
    'es': 'Aprendizaje Automático',
    'zh': '机器学习'
  },
  'ai.natural_language': {
    'en': 'Natural Language Processing',
    'es': 'Procesamiento de Lenguaje Natural',
    'zh': '自然语言处理'
  },

  // Voice Interface
  'voice.speak': {
    'en': 'Speak',
    'es': 'Hablar',
    'zh': '说话'
  },
  'voice.listen': {
    'en': 'Listen',
    'es': 'Escuchar',
    'zh': '听'
  },
  'voice.recording': {
    'en': 'Recording...',
    'es': 'Grabando...',
    'zh': '录音中...'
  },
  'voice.processing': {
    'en': 'Processing...',
    'es': 'Procesando...',
    'zh': '处理中...'
  },

  // Error Messages
  'error.general': {
    'en': 'An error occurred. Please try again.',
    'es': 'Ocurrió un error. Por favor, inténtalo de nuevo.',
    'zh': '发生错误。请重试。'
  },
  'error.network': {
    'en': 'Network error. Please check your connection.',
    'es': 'Error de red. Por favor, verifica tu conexión.',
    'zh': '网络错误。请检查您的连接。'
  },
  'error.not_found': {
    'en': 'Not found.',
    'es': 'No encontrado.',
    'zh': '未找到。'
  },

  // Success Messages
  'success.saved': {
    'en': 'Successfully saved!',
    'es': '¡Guardado exitosamente!',
    'zh': '保存成功！'
  },
  'success.updated': {
    'en': 'Successfully updated!',
    'es': '¡Actualizado exitosamente!',
    'zh': '更新成功！'
  },
  'success.deleted': {
    'en': 'Successfully deleted!',
    'es': '¡Eliminado exitosamente!',
    'zh': '删除成功！'
  },

  // Form Labels
  'form.name': {
    'en': 'Name',
    'es': 'Nombre',
    'zh': '姓名'
  },
  'form.email': {
    'en': 'Email',
    'es': 'Correo Electrónico',
    'zh': '电子邮件'
  },
  'form.phone': {
    'en': 'Phone',
    'es': 'Teléfono',
    'zh': '电话'
  },
  'form.age': {
    'en': 'Age',
    'es': 'Edad',
    'zh': '年龄'
  },
  'form.gender': {
    'en': 'Gender',
    'es': 'Género',
    'zh': '性别'
  },
  'form.symptoms': {
    'en': 'Symptoms',
    'es': 'Síntomas',
    'zh': '症状'
  },
  'form.medications': {
    'en': 'Medications',
    'es': 'Medicamentos',
    'zh': '药物'
  },
  'form.medical_history': {
    'en': 'Medical History',
    'es': 'Historial Médico',
    'zh': '病史'
  },

  // Buttons
  'button.start_trial': {
    'en': 'Start Trial',
    'es': 'Comenzar Ensayo',
    'zh': '开始试验'
  },
  'button.learn_more': {
    'en': 'Learn More',
    'es': 'Aprender Más',
    'zh': '了解更多'
  },
  'button.contact_us': {
    'en': 'Contact Us',
    'es': 'Contáctanos',
    'zh': '联系我们'
  },
  'button.get_started': {
    'en': 'Get Started',
    'es': 'Comenzar',
    'zh': '开始使用'
  },

  // Headers & Titles
  'title.welcome': {
    'en': 'Welcome to GreyGuard Trials',
    'es': 'Bienvenido a GreyGuard Trials',
    'zh': '欢迎使用GreyGuard试验'
  },
  'title.find_trials': {
    'en': 'Find Clinical Trials',
    'es': 'Encontrar Ensayos Clínicos',
    'zh': '寻找临床试验'
  },
  'title.about': {
    'en': 'About',
    'es': 'Acerca de',
    'zh': '关于'
  },
  'title.help': {
    'en': 'Help',
    'es': 'Ayuda',
    'zh': '帮助'
  },

  // Descriptions
  'description.platform': {
    'en': 'Decentralized clinical trial matching platform powered by AI and blockchain technology.',
    'es': 'Plataforma descentralizada de coincidencia de ensayos clínicos impulsada por tecnología de IA y blockchain.',
    'zh': '由AI和区块链技术驱动的去中心化临床试验匹配平台。'
  },
  'description.privacy': {
    'en': 'Your health data remains private and secure with zero-knowledge proofs.',
    'es': 'Sus datos de salud permanecen privados y seguros con pruebas de conocimiento cero.',
    'zh': '您的健康数据通过零知识证明保持私密和安全。'
  }
};

export const getTranslation = (key: string, languageId: string): string => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  const translatedText = translation[languageId];
  if (!translatedText) {
    console.warn(`Translation not found for language: ${languageId}, key: ${key}`);
    // Fallback to English
    return translation['en'] || key;
  }
  
  return translatedText;
};

export const getCurrentLanguage = (): Language => {
  // In a real app, this would come from user preferences or browser settings
  const savedLanguage = localStorage.getItem('preferred-language');
  if (savedLanguage) {
    const language = supportedLanguages.find(lang => lang.id === savedLanguage);
    if (language && language.enabled) {
      return language;
    }
  }
  
  // Default to English
  return supportedLanguages.find(lang => lang.id === 'en') || supportedLanguages[0];
};

export const setLanguage = (languageId: string): void => {
  localStorage.setItem('preferred-language', languageId);
  // In a real app, this would trigger a re-render of the app
  window.location.reload();
};

export const getEnabledLanguages = (): Language[] => {
  return supportedLanguages.filter(lang => lang.enabled);
};

export const formatNumber = (number: number, languageId: string): string => {
  try {
    return new Intl.NumberFormat(languageId).format(number);
  } catch {
    return number.toString();
  }
};

export const formatDate = (date: Date, languageId: string): string => {
  try {
    return new Intl.DateTimeFormat(languageId, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
};

export const formatCurrency = (amount: number, currency: string, languageId: string): string => {
  try {
    return new Intl.NumberFormat(languageId, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};
