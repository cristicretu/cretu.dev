import Image from "next/image";
import Link from "next/link";
import Container from "../components/Container";
import Projects from "../components/Projects";

export default function Home() {
  return (
    <Container>
      <div className="my-2 sm:my-4 md:my-8 flex px-2 sm:px-2 md:px-0 flex-col justify-center space-y-4 md:space-y-10 items-start max-w-2xl mx-auto mb-16">
        <Projects />
      </div>
    </Container>
  );
}
