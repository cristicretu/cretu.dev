import Container from '../components/Container';
import React from 'react'

interface keybindingsProps { }

const keybindings: React.FC<keybindingsProps> = ({ }) => {
  return (<Container>
    <div className="my-2 sm:my-4 md:my-8 flex flex-col justify-center space-y-4 md:space-y-10 items-start max-w-2xl mx-auto mb-16">
      <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-4">
        Keybindings
      </h1>
      <div className='flex flex-col space-y-2'>
        <p>Press <kbd className='mykbd'>⌘</kbd>{" "}<kbd className='mykbd'>g</kbd> to change the theme.</p>
        <p>Press <kbd className='mykbd'>⌘</kbd>{" "}<kbd className='mykbd'>j</kbd> to go back.</p>
      </div>
    </div>
  </Container>);
}
export default keybindings