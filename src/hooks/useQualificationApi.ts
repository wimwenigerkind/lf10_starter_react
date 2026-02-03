import {useAuth} from "react-oidc-context";
import {useState, useCallback} from "react";

const apiUrl = import.meta.env.VITE_EMS_API_URL || 'http://localhost:8089';

export function useQualificationApi() {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQualifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (auth.user?.access_token) {
        headers['Authorization'] = `Bearer ${auth.user.access_token}`;
      }

      const response = await fetch(apiUrl + '/qualifications', {headers});
      if (!response.ok) {
        setError("Fehler beim Laden der Qualifikationen");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }, [auth.user?.access_token]);

  const fetchEmployeesByQualification = useCallback(async (qualificationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (auth.user?.access_token) {
        headers['Authorization'] = `Bearer ${auth.user.access_token}`;
      }

      const response = await fetch(`${apiUrl}/qualifications/${qualificationId}/employees`, {headers});
      if (!response.ok) {
        setError("Fehler beim Laden der Mitarbeiter");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }, [auth.user?.access_token]);

  return {fetchQualifications, fetchEmployeesByQualification, loading, error};
  // Create Qualification
  const createQualification = useCallback(async (qualification: { skill: string }) => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (auth.user?.access_token) {
        headers['Authorization'] = `Bearer ${auth.user.access_token}`;
      }

      const response = await fetch(apiUrl + '/qualifications', {
        method: 'POST',
        headers,
        body: JSON.stringify(qualification)
      });
      if (!response.ok) {
        setError("Fehler beim Erstellen der Qualifikation");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }, [auth.user?.access_token]);

  // Update Qualification
  const updateQualification = useCallback(async (id: string, qualification: { skill: string }) => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (auth.user?.access_token) {
        headers['Authorization'] = `Bearer ${auth.user.access_token}`;
      }

      const response = await fetch(`${apiUrl}/qualifications/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(qualification)
      });
      if (!response.ok) {
        setError("Fehler beim Aktualisieren der Qualifikation");
      }
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }, [auth.user?.access_token]);

  // Delete Qualification
  const deleteQualification = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (auth.user?.access_token) {
        headers['Authorization'] = `Bearer ${auth.user.access_token}`;
      }

      const response = await fetch(`${apiUrl}/qualifications/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        setError("Fehler beim Löschen der Qualifikation");
      }
      return response.ok;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }, [auth.user?.access_token]);

  return {fetchQualifications, createQualification, updateQualification, deleteQualification, loading, error};
}