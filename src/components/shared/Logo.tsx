import lightLogo from "@/assets/samantha-logo-light.svg"; // Replace with your actual filename
import darkLogo from "@/assets/samantha-logo-dark.svg";   // Replace with your actual filename

interface LogoProps {
  className?: string;
}

export function SamanthaLogo({ className }: LogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* Light Theme Logo - Hidden when .dark class is present */}
      <img 
        src={lightLogo} 
        alt="Samantha Analytics" 
        className="block dark:hidden h-full w-auto object-contain" 
      />

      {/* Dark Theme Logo - Hidden by default, shown when .dark class is present */}
      <img 
        src={darkLogo} 
        alt="Samantha Analytics" 
        className="hidden dark:block h-full w-auto object-contain" 
      />
    </div>
  );
}