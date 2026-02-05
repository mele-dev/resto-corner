import { useState } from 'react';
import { Info, X } from 'lucide-react';
import Modal from '../Modal/Modal';

interface HelpIconProps {
  title: string;
  content: React.ReactNode;
  className?: string;
}

export default function HelpIcon({ title, content, className = '' }: HelpIconProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors ${className}`}
        title="Ayuda"
        aria-label="Mostrar ayuda"
      >
        <Info size={16} />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Info className="text-blue-600" size={24} />
            <span>{title}</span>
          </div>
        }
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="prose prose-sm max-w-none text-gray-700">
            {content}
          </div>
        </div>
      </Modal>
    </>
  );
}
