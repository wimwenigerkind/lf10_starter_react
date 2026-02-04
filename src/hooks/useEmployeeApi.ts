import {useAuth} from "react-oidc-context";
import {useState, useCallback} from "react";
import type {EmployeeFormData} from "@/pages/createEmployeePage.tsx";

const apiUrl = import.meta.env.VITE_EMS_API_URL || 'http://localhost:8089';

export function useEmployeeApi() {
    const auth = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            if (auth.user?.access_token) {
                headers['Authorization'] = `Bearer ${auth.user.access_token}`;
            }

            const response = await fetch(apiUrl + '/employees', {headers});
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

  const deleteEmployee = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (auth.user?.access_token) {
        headers['Authorization'] = `Bearer ${auth.user.access_token}`;
      }
      const response = await fetch(apiUrl + '/employees/' + id, {
        method: 'DELETE',
        headers: headers
      });
      if (!response.ok) throw new Error(await response.text());
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employee: EmployeeFormData) => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (auth.user?.access_token) {
        headers['Authorization'] = `Bearer ${auth.user.access_token}`;
      }

      const response = await fetch(`${apiUrl}/employees`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(employee)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addQualificationToEmployee = async (employeeId: string, skill: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (auth.user?.access_token) {
      headers['Authorization'] = `Bearer ${auth.user.access_token}`;
    }

    const response = await fetch(`${apiUrl}/employees/${employeeId}/qualifications`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ skill })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  };

  const updateEmployee = async (employeeId: string, employee: EmployeeFormData) => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (auth.user?.access_token) {
        headers['Authorization'] = `Bearer ${auth.user.access_token}`;
      }

      const response = await fetch(`${apiUrl}/employees/${employeeId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(employee)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeQualificationFromEmployee = async (employeeId: string, skill: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (auth.user?.access_token) {
      headers['Authorization'] = `Bearer ${auth.user.access_token}`;
    }

    const response = await fetch(`${apiUrl}/employees/${employeeId}/qualifications`, {
      method: 'DELETE',
      headers: headers,
      body: JSON.stringify({ skill })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return await response.json();
  };

  return {fetchEmployees, deleteEmployee, createEmployee, addQualificationToEmployee, updateEmployee, removeQualificationFromEmployee, loading, error};
}