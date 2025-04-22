import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simple inline translations for critical UI elements to prevent app crashes
const resources = {
  en: {
    translation: {
      appTitle: "TrialSage™ IND Wizard",
      submit: "Submit by",
      wizardHeader: {
        title: "IND Preparation Wizard 3.3",
        moduleReadiness: "Module Readiness",
        confidenceInterval: "95% Confidence Interval",
        ready: "Ready",
        errors: "Errors",
        docs: "Docs",
        savings: "Savings"
      },
      moduleNames: {
        module1: "Module 1: Administrative",
        module2: "Module 2: Summaries",
        module3: "Module 3: Quality", 
        module4: "Module 4: Nonclinical",
        module5: "Module 5: Clinical"
      },
      stepNav: {
        step: "Step",
        completion: "Completion",
        confidence: "Confidence",
        estimatedCompletion: "Est. completion",
        trend: "Progress trend",
        help: "Legend",
        validStep: "Valid step",
        issuesDetected: "Issues detected",
        titles: {
          0: "Initial Planning",
          1: "Nonclinical Data",
          2: "CMC Data",
          3: "Clinical Protocol",
          4: "Investigator Brochure",
          5: "FDA Forms",
          6: "Final Assembly"
        }
      }
    }
  },
  es: {
    translation: {
      appTitle: "TrialSage™ Asistente IND",
      submit: "Enviar antes de",
      wizardHeader: {
        title: "Asistente de Preparación IND 3.3",
        moduleReadiness: "Estado de los Módulos",
        confidenceInterval: "Intervalo de Confianza del 95%",
        ready: "Listo",
        errors: "Errores",
        docs: "Docs", 
        savings: "Ahorros"
      },
      moduleNames: {
        module1: "Módulo 1: Administrativo",
        module2: "Módulo 2: Resúmenes",
        module3: "Módulo 3: Calidad",
        module4: "Módulo 4: No Clínico",
        module5: "Módulo 5: Clínico"
      },
      stepNav: {
        step: "Paso",
        completion: "Completado",
        confidence: "Confianza",
        estimatedCompletion: "Finalización est.",
        trend: "Tendencia de progreso",
        help: "Leyenda",
        validStep: "Paso válido",
        issuesDetected: "Problemas detectados",
        titles: {
          0: "Planificación inicial",
          1: "Datos no clínicos",
          2: "Datos CMC",
          3: "Protocolo clínico",
          4: "Folleto del investigador",
          5: "Formularios FDA",
          6: "Ensamblaje final"
        }
      }
    }
  },
  ja: {
    translation: {
      appTitle: "TrialSage™ INDウィザード",
      submit: "提出期限",
      wizardHeader: {
        title: "IND準備ウィザード 3.3",
        moduleReadiness: "モジュール準備状況",
        confidenceInterval: "95%信頼区間",
        ready: "準備完了",
        errors: "エラー",
        docs: "文書",
        savings: "節約額"
      },
      moduleNames: {
        module1: "モジュール1：管理情報",
        module2: "モジュール2：概要",
        module3: "モジュール3：品質",
        module4: "モジュール4：非臨床",
        module5: "モジュール5：臨床"
      }
    }
  },
  fr: {
    translation: {
      appTitle: "TrialSage™ Assistant IND",
      submit: "Soumettre avant",
      wizardHeader: {
        title: "Assistant de Préparation IND 3.3",
        moduleReadiness: "État de Préparation des Modules",
        confidenceInterval: "Intervalle de Confiance à 95%",
        ready: "Prêt",
        errors: "Erreurs",
        docs: "Docs",
        savings: "Économies"
      },
      moduleNames: {
        module1: "Module 1: Administratif",
        module2: "Module 2: Résumés",
        module3: "Module 3: Qualité",
        module4: "Module 4: Non-clinique",
        module5: "Module 5: Clinique"
      }
    }
  }
};

// Configure i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false // Avoid suspense to prevent crashes
    }
  });

export default i18n;