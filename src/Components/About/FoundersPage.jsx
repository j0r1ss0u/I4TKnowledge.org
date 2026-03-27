import React from 'react';
import { useAuth } from '../AuthContext';
import ui from '../../translations/ui';

const MemberCard = ({ name, title, imageUrl, linkedinUrl }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
      <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
    </div>
    <h3 className="text-base font-bold mb-2">{name}</h3>
    <p className="text-sm text-gray-600 max-w-[250px]">{title}</p>
    {linkedinUrl && (
      <a href={linkedinUrl} 
         className="mt-2 bg-white rounded-full p-1"
         target="_blank" 
         rel="noopener noreferrer">
        <img src="/assets/founders/linkedin.png" alt="LinkedIn" className="w-5 h-5" />
      </a>
    )}
  </div>
);

const OrganizationSection = ({ logo, members }) => (
  <div className="mb-24 w-full">
    <div className="flex justify-center mb-16">
      <img src={logo.url} alt={logo.alt} className="h-16 object-contain" />
    </div>
    <div className={`grid ${
      members.length === 1 
        ? 'grid-cols-1' 
        : members.length === 3 
          ? 'grid-cols-3 gap-x-20' 
          : 'grid-cols-2 gap-x-32'
    } mx-auto max-w-5xl`}>
      {members.map(member => (
        <MemberCard key={member.name} {...member} />
      ))}
    </div>
  </div>
);

const FoundersPage = () => {
  const { language } = useAuth();
  const t = ui[language] ?? ui.en;

  const organizations = [
    {
      logo: { url: "/assets/founders/logos/portulans.png", alt: "Portulans Institute" },
      members: [
        {
          name: "Carolina A. ROSSINI",
          title: "Co-founder Executive Innovation & Partnership Director",
          imageUrl: "/assets/founders/photos/carolina-rossini.jpg",
          linkedinUrl: "https://www.linkedin.com/in/carolinarossini/"
        },
        {
          name: "Bill DUTTON",
          title: "Director Portulans Institute University of Oxford",
          imageUrl: "/assets/founders/photos/bill-dutton.jpg",
          linkedinUrl: "https://www.linkedin.com/in/william-dutton-1755772/"
        },
        {
          name: "Elizaveta CHERNENKO",
          title: "Assistant Professor, Portulans Institute",
          imageUrl: "/assets/founders/photos/elizaveta-chernenko.jpg",
          linkedinUrl: "https://www.linkedin.com/in/elizaveta-chernenko/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/research-ict-africa.png", alt: "Research ICT Africa" },
      members: [
        {
          name: "Alison GILLWALD",
          title: "Executive Director, Research ICT Africa, Adjunct Professor at University of Cape Town",
          imageUrl: "/assets/founders/photos/alison-gillwald.jpg",
          linkedinUrl: "https://www.linkedin.com/in/alison-gillwald-6183b114/"
        },
        {
          name: "Liz OREMBO",
          title: "Research Fellow, Research ICT Africa",
          imageUrl: "/assets/founders/photos/liz-orembo.jpg",
          linkedinUrl: "https://www.linkedin.com/in/lizorembo/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/observacom.png", alt: "OBSERVACOM" },
      members: [
        {
          name: "Bruce GIRARD",
          title: "Executive Director of UHACO",
          imageUrl: "/assets/founders/photos/bruce-girard.jpg",
          linkedinUrl: "https://www.linkedin.com/in/brucegirard/"
        },
        {
          name: "Gustavo GÓMEZ",
          title: "Executive Director at OBSERVACOM",
          imageUrl: "/assets/founders/photos/gustavo-gomez.jpg",
          linkedinUrl: "https://www.linkedin.com/in/gusgomez/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/IT-for-change.jpg", alt: "IT for Change" },
      members: [
        {
          name: "Merrin Mohammed ASHRAF",
          title: "Researcher, Fair Change",
          imageUrl: "/assets/founders/photos/merrin-ashraf.jpg",
          linkedinUrl: "https://www.linkedin.com/in/merrin-ashraf/"
        },
        {
          name: "Anita GURUMURTHY",
          title: "Executive Director, Fair Change",
          imageUrl: "/assets/founders/photos/anita-gurumurthy.jpg",
          linkedinUrl: "https://www.linkedin.com/in/anita-gurumurthy/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/tesaco.png", alt: "TESaCo" },
      members: [
        {
          name: "Serena CIRANNA",
          title: "Researcher in Technology and Social Media",
          imageUrl: "/assets/founders/photos/serena-ciranna.jpg",
          linkedinUrl: "https://www.linkedin.com/in/serenaciranna/"
        },
        {
          name: "Daniel ANDLER",
          title: "Professor at Sorbonne University",
          imageUrl: "/assets/founders/photos/daniel-andler.jpg",
          linkedinUrl: "https://www.linkedin.com/in/daniel-andler/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/digital-rights-foundation.png", alt: "Digital Rights Foundation" },
      members: [
        {
          name: "Seerat KHAN",
          title: "Programme Lead at Digital Rights",
          imageUrl: "/assets/founders/photos/seerat-khan.jpg",
          linkedinUrl: "https://www.linkedin.com/in/seeratkhan/"
        },
        {
          name: "Nighat DAD",
          title: "Executive Director Digital Rights",
          imageUrl: "/assets/founders/photos/nighat-dad.jpg",
          linkedinUrl: "https://www.linkedin.com/in/nighatdad/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/global-partners-digital.png", alt: "Global Partners Digital" },
      members: [
        {
          name: "Ian BARBER",
          title: "International Human Rights & Technology Leader",
          imageUrl: "/assets/founders/photos/ian-barber.jpg",
          linkedinUrl: "https://www.linkedin.com/in/ianbarber/"
        },
        {
          name: "Maria Paz CANALES",
          title: "Head of Legal, Policy and Research - GPD",
          imageUrl: "/assets/founders/photos/maria-paz-canales.jpg",
          linkedinUrl: "https://www.linkedin.com/in/mariapazcanales/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/internet-lab.png", alt: "InternetLab" },
      members: [
        {
          name: "Iná JOST",
          title: "Head of Research",
          imageUrl: "/assets/founders/photos/ina-jost.jpg",
          linkedinUrl: "https://www.linkedin.com/in/inajost/"
        },
        {
          name: "Fernanda K. MARTINS",
          title: "Director at InternetLab",
          imageUrl: "/assets/founders/photos/fernanda-martins.jpg",
          linkedinUrl: "https://www.linkedin.com/in/fernandakmartins/"
        }
      ]
    },

    {
        logo: { url: "/assets/founders/logos/radicalxchange.png", alt: "RadicalChange" },
        members: [
        {
          name: "Christophe GAUTHIER",
          title: "RadicalChange",
          imageUrl: "/assets/founders/photos/christophe-gauthier.jpg",
          linkedinUrl: "https://www.linkedin.com/in/christophegauthier/"
        }
      ]
    },
    {
        logo: { url: "/assets/founders/logos/leplusimportant.png", alt: "# Le plus important" },
        members: [
        {
          name: "Mathias DUFOUR",
            title: "President RadicalChange",
            imageUrl: "/assets/founders/photos/mathias-dufour.jpg",
            linkedinUrl: "https://www.linkedin.com/in/mathiasdufour/"
        }
      ]
    },

    {
        logo: { url: "/assets/founders/logos/iamcr.png", alt: "IAMCR" },
        members: [
      {
        name: "Jeremy SHTERN",
          title: "Associate Professor, Ryerson University, Canada",
          imageUrl: "/assets/founders/photos/jeremy-shtern.jpg",
          linkedinUrl: "https://www.linkedin.com/in/jeremy-shtern/"
      }
    ]
    },
    {
      logo: { url: "/assets/founders/logos/institute-for-accountability.png", alt: "# Institute for accountability in the digital age" },
      members: [
      {
        name: "Frits BUSSEMAKER",
          title: "Chairman, Institute for Accountability in the Digital Age",
          imageUrl: "/assets/founders/photos/frits-bussemaker.png",
          linkedinUrl: "https://www.linkedin.com/in/fritsbussemaker/"
      }
    ]
    },
    
    {
      logo: { url: "/assets/founders/logos/innovation-for-policy.png", alt: "Innovation for Policy Foundation" },
      members: [
        {
          name: "Jon STEVER",
          title: "Co-founder and Managing Director",
          imageUrl: "/assets/founders/photos/jon-stever.jpg",
          linkedinUrl: "https://www.linkedin.com/in/jonstever/"
        },
        {
          name: "Aniya HAMILTON",
          title: "Project Associate and Research Lead",
          imageUrl: "/assets/founders/photos/aniya-hamilton.png",
          linkedinUrl: "https://www.linkedin.com/in/arnyahamilton/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/ambivium.png", alt: "Ambivium" },
      members: [
        {
          name: "Nubert BOUBEKA",
          title: "Founder Ambivium",
          imageUrl: "/assets/founders/photos/nubert-boubeka.jpg",
          linkedinUrl: "https://www.linkedin.com/in/nubert-boubeka-64750836/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/IDPL.png", alt: "International Digital Policy Lab" },
      members: [
        {
          name: "Ingrid VOLKMER",
          title: "Director at The International Digital Policy Lab",
          imageUrl: "/assets/founders/photos/ingrid-volkmer.jpg",
          linkedinUrl: "https://www.linkedin.com/in/professor-ingrid-volkmer-56802533/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/amic.png", alt: "Asian Media Information and Communication Centre" },
      members: [
        {
          name: "Ramon TUAZON",
          title: "Secretary General",
          imageUrl: "/assets/founders/photos/ramon-tuazon.jpg",
          linkedinUrl: "https://www.linkedin.com/in/ramon-r-tuazon-976b6645/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/internet-society.png", alt: "Internet Society" },
      members: [
        {
          name: "Amrita SENGUPTA",
          title: "Research and Program Lead",
          imageUrl: "/assets/founders/photos/amrita-sengupta.jpg",
          linkedinUrl: "https://www.linkedin.com/in/amrita-sengupta-she-her-18b87289/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/global-network-internet-and-society.png", alt: "Global Summit" },
      members: [
        {
          name: "Armando GUIO",
          title: "Executive Director",
          imageUrl: "/assets/founders/photos/armando-guio.jpg",
          linkedinUrl: "https://www.linkedin.com/in/armando-guio-espa%C3%B1ol-2b563973/"
        }
      ]
    },
    {
      logo: { url: "/assets/founders/logos/institute-for-ethical-governance.png", alt: "International institute for Ethical Governance and Accountability" },
      members: [
        {
          name: "Roger LATCHMAN",
          title: "Executive Director IECA",
          imageUrl: "/assets/founders/photos/roger-latchman.jpg",
          linkedinUrl: "https://www.linkedin.com/in/rogerlatchman/"
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-8">
      <h1 className="text-4xl font-serif font-bold text-gray-900 mb-16 text-center">{t.founders.pageTitle}</h1>
      <div className="space-y-24">
        {organizations.map((org, index) => (
          <OrganizationSection key={index} {...org} />
        ))}
      </div>
    </div>
  );
};

export default FoundersPage;
