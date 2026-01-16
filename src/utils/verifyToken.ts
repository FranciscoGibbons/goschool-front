const verifyToken = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/proxy/verify-token', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido o expirado
        return false;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
};

export default verifyToken;
