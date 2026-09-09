import HeroAspiracional from './components/HeroAspiracional';
import ComoFunciona from './components/ComoFunciona';
import SocialProof from './components/SocialProof';
import Testimonios from './components/Testimonios';
import CtaFinal from './components/CtaFinal';
import FooterMinimal from './components/FooterMinimal';

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100">
      <HeroAspiracional />
      <ComoFunciona />
      <div id="servicios-section">
        <SocialProof />
      </div>
      <Testimonios />
      <CtaFinal />
      <FooterMinimal />
    </div>
  );
}
