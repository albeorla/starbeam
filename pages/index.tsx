import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<{ message: string; details: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    
    if (!url) {
      setStatus({ message: 'Error', details: 'Please enter a valid URL' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ message: data.message, details: data.details });
        setUrl(''); // Clear the input field after successful submission
      } else {
        setStatus({ message: data.error, details: data.details });
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({ 
        message: 'Error', 
        details: 'An unexpected error occurred. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submit a Link</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a URL"
          required
          className="w-full p-2 border border-gray-300 rounded"
          disabled={isLoading}
        />
        <button 
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      {status && (
        <div className={`p-4 rounded ${status.message === 'Error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          <p className="font-bold">{status.message}</p>
          <p>{status.details}</p>
        </div>
      )}
    </div>
  );
}