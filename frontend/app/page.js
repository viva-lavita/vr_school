import Main from "./components/mainPage/Main/Main";
import About from "./components/mainPage/About/About";
import Team from "./components/mainPage/Team/Team";
import Advantages from "./components/mainPage/Advantages/Advantages";
import Registration from "./components/mainPage/Registration/Registration";
import Contacts from "./components/mainPage/Contacts/Contacts";

export default function Home() {
  return (
    <div>
      <Main />

      <section id="about">
        <About />
      </section>

      <section id="team">
        <Team />
      </section>

      <Advantages />

      <Registration />

      <section id="contacts">
        <Contacts />
      </section>
    </div>
  );
}
