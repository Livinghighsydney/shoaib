import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const { token } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/content');
      setContent(data);
    } catch {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const updateSection = useCallback(async (key, data, silent = false) => {
    try {
      await axios.put(`/api/content/${key}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContent(prev => ({ ...prev, [key]: data }));
      if (!silent) toast.success('Saved!');
    } catch {
      if (!silent) toast.error('Save failed');
    }
  }, [token]);

  const uploadImage = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await axios.post('/api/content/upload/image', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.url;
  }, [token]);

  return (
    <ContentContext.Provider value={{ content, loading, updateSection, uploadImage, fetchContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => useContext(ContentContext);
