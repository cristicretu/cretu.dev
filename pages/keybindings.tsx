import Container from '../components/Container';
import React from 'react'

interface keybindingsProps { }

const keybindings: React.FC<keybindingsProps> = ({ }) => {
  return (<Container>
    <div className="my-2 sm:my-4 md:my-8 flex flex-col justify-center space-y-4 md:space-y-10 items-start max-w-2xl mx-auto mb-16 text-gray-800 dark:text-gray-200">
      <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4">
        Keybindings
      </h1>
      <div className='flex flex-col space-y-2'>
        <p>Press <kbd className='mykbd'>g</kbd>{" "}<kbd className='mykbd'>h</kbd> to go to the home page.</p>
        <p>Press <kbd className='mykbd'>g</kbd>{" "}<kbd className='mykbd'>a</kbd> to go to the about me page.</p>
        <p>Press <kbd className='mykbd'>g</kbd>{" "}<kbd className='mykbd'>b</kbd> to go to the blog.</p>
        <p>Press <kbd className='mykbd'>g</kbd>{" "}<kbd className='mykbd'>p</kbd> to go to the projects page.</p>
        <p>Press <kbd className='mykbd'>g</kbd>{" "}<kbd className='mykbd'>k</kbd> to see the keybindings.</p>
      </div>
    </div>
  </Container>);
}
export default keybindings