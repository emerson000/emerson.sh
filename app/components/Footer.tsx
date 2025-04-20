import { SiGithub } from '@icons-pack/react-simple-icons';

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-4 dark:bg-black">
      <div className="container mx-auto px-4 flex items-center justify-center gap-2">
        <a href="https://github.com/emerson000/emerson.sh"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
          title="View this project on GitHub">
          <SiGithub />
        </a>
      </div>
    </footer>
  );
}
