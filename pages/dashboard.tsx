import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LinkItem {
  id: number;
  url: string;
  type: string;
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newLink, setNewLink] = useState({ url: '', type: 'webpage' });
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/links');
      if (!response.ok) {
        throw new Error('Failed to fetch links');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setLinks(data);
      } else {
        throw new Error('Received invalid data format');
      }
    } catch (error) {
      console.error('Error fetching links:', error);
      setError('Failed to load links. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLink) {
      await fetch(`/api/links/${editingLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink),
      });
    } else {
      await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink),
      });
    }
    setNewLink({ url: '', type: 'webpage' });
    setEditingLink(null);
    fetchLinks();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/links/${id}`, { method: 'DELETE' });
    fetchLinks();
  };

  const handleEdit = (link: LinkItem) => {
    setEditingLink(link);
    setNewLink({ url: link.url, type: link.type });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">URL</span>
          </label>
          <input
            type="url"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            placeholder="Enter a URL"
            required
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control mt-2">
          <label className="label">
            <span className="label-text">Type</span>
          </label>
          <select
            value={newLink.type}
            onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
            className="select select-bordered w-full"
          >
            <option value="webpage">Webpage</option>
            <option value="github">GitHub</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary mt-4 w-full"
        >
          {editingLink ? 'Update Link' : 'Add Link'}
        </button>
      </form>
      {isLoading ? (
        <div className="loading loading-spinner loading-lg"></div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>URL</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.length > 0 ? (
                links.map((link) => (
                  <tr key={link.id}>
                    <td>{link.url}</td>
                    <td>{link.type}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(link)}
                        className="btn btn-warning btn-sm mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="btn btn-error btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center">No links found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Link href="/" className="btn btn-link mt-4">
        Back to Home
      </Link>
    </div>
  );
}