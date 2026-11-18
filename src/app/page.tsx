import { Hero } from "@/components/Hero";
import { ParticipantApp } from "@/components/ParticipantApp";
import { Room } from "@/components/scene/Room";
import { ThemeSwitch } from "@/components/ThemeProvider";

export default function Home() {
  return (
    <Room>
      <div className="layout">
        <Hero />
        <div className="layout__side">
          <ParticipantApp />
        </div>
      </div>
      <ThemeSwitch />
    </Room>
  );
}
