import {useAuth} from "react-oidc-context";
import {useState, useCallback} from "react";

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

    return {fetchEmployees, loading, error};
}