import React, { useState, useEffect } from 'react';
import Login from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventFiles, setEventFiles] = useState([]);

  // Função para criptografar dados
  const encryptData = (data, key) => {
    return data.split('').map((char, index) => {
      return String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length));
    }).join('');
  };

  // Função para descriptografar dados
  const decryptData = (data, key) => {
    return encryptData(data, key); // XOR é reversível
  };

  useEffect(() => {
    if (isLoggedIn && password) {
      const encryptedData = localStorage.getItem('encryptedEvents');
      if (encryptedData) {
        try {
          const decryptedData = decryptData(encryptedData, password);
          setEvents(JSON.parse(decryptedData));
        } catch (error) {
          console.error('Erro ao descriptografar eventos:', error);
        }
      }
    }
  }, [isLoggedIn, password]);

  const handleLogin = (pass) => {
    setPassword(pass);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
    setEvents([]);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowEventModal(true);
  };

  const handleAddEvent = () => {
    if (eventTitle.trim()) {
      const newEvent = {
        id: Date.now(),
        title: eventTitle,
        date: selectedDate,
        files: eventFiles
      };

      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);

      // Criptografa e salva os eventos
      const encryptedData = encryptData(JSON.stringify(updatedEvents), password);
      localStorage.setItem('encryptedEvents', encryptedData);

      setEventTitle('');
      setEventFiles([]);
      setShowEventModal(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            data: reader.result
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(uploadedFiles => {
      setEventFiles(prev => [...prev, ...uploadedFiles]);
    });
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);

    // Criptografa e salva os eventos atualizados
    const encryptedData = encryptData(JSON.stringify(updatedEvents), password);
    localStorage.setItem('encryptedEvents', encryptedData);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Calendário Interativo</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sair
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          {/* Calendário e eventos aqui */}
          <div className="grid grid-cols-7 gap-2">
            {/* Renderize os dias do calendário aqui */}
          </div>
        </div>

        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Adicionar Evento</h2>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Título do evento"
                className="w-full p-2 border rounded mb-4"
              />
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Eventos</h2>
          {events.map(event => (
            <div key={event.id} className="bg-white p-4 rounded-lg shadow mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{event.title}</h3>
                  <p className="text-gray-600">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  {event.files && event.files.length > 0 && (
                    <div className="mt-2">
                      <p className="font-bold">Arquivos:</p>
                      {event.files.map((file, index) => (
                        <a
                          key={index}
                          href={file.data}
                          download={file.name}
                          className="text-blue-500 hover:underline block"
                        >
                          {file.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
