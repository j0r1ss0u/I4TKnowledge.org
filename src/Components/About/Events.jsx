import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ExternalLink, Globe, Users, PlusCircle } from 'lucide-react';
import { eventsManagementService } from '../../services/eventsManagement';
import { projetManagementService } from '../../services/projectManagement';
import { useAuth } from '../AuthContext';
import ui from '../../translations/ui';

// -------------------------------------------
// TimelineEvent sub-component
// -------------------------------------------
const TimelineEvent = ({ date, title, location, organizer, url, isProject = false, projectId = null }) => {
  const { user, language } = useAuth();
  const t = ui[language] ?? ui.en;
  const ev = t.events;

  const canAccessForum = user && (user.role === 'admin' || user.role === 'validator' || user.role === 'member');

  let formattedDate = ev.dateUndefined;
  if (date) {
    try {
      formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (error) {
      console.error("Date formatting error:", error, date);
    }
  }

  const handleProjectClick = () => {
    if (isProject && projectId && canAccessForum) {
      window.location.hash = `forum?project=${projectId}`;
      sessionStorage.setItem('selectedProjectId', projectId);
    }
  };

  const cursorStyle = (isProject && !canAccessForum) ? "default" : "pointer";

  return (
    <div className="flex items-center min-h-[80px] group relative">
      {!isProject ? (
        <>
          <div className="w-[45%] text-right pr-8">
            <div className="group-hover:transform group-hover:scale-105 transition-transform">
              <p className="text-base font-medium text-orange-600">{formattedDate}</p>
              <p className="font-semibold text-xl">{title}</p>
              {location && (
                <p className="text-base text-gray-600 flex items-center justify-end">
                  <MapPin className="w-4 h-4 mr-1" />
                  {location}
                </p>
              )}
              {organizer && <p className="text-sm text-gray-500">By: {organizer}</p>}
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline inline-flex items-center mt-1 justify-end"
                >
                  <span className="mr-1">{ev.moreInfo}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <div className="relative flex flex-col items-center w-[10%]">
            <div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-orange-300 to-orange-500"
              style={{ transform: 'translateY(-50%)', height: 'calc(100% + 80px)' }}
            />
            <div className="relative w-4 h-4 bg-orange-500 rounded-full border-4 border-orange-200 z-10 transition-all duration-200 group-hover:scale-150 group-hover:border-orange-100" />
          </div>
          <div className="w-[45%]" />
        </>
      ) : (
        <>
          <div className="w-[45%]" />
          <div className="relative flex flex-col items-center w-[10%]">
            <div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-300 to-emerald-500"
              style={{ transform: 'translateY(-50%)', height: 'calc(100% + 80px)' }}
            />
            <div className="relative w-4 h-4 bg-emerald-500 rounded-full border-4 border-emerald-200 z-10 transition-all duration-200 group-hover:scale-150 group-hover:border-emerald-100" />
          </div>
          <div className="w-[45%] pl-8">
            <div
              className={`${canAccessForum ? 'group-hover:transform group-hover:scale-105 transition-transform' : ''}`}
              style={{ cursor: cursorStyle }}
              onClick={handleProjectClick}
            >
              <p className="text-base font-medium text-emerald-600">{formattedDate}</p>
              <p className="font-semibold text-xl">{title}</p>
              {location && (
                <p className="text-base text-gray-600 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {location}
                </p>
              )}
              <div className="mt-2">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                  {ev.communityProject}
                </span>
                {!canAccessForum && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {ev.loginRequired}
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// -------------------------------------------
// EventForm sub-component
// -------------------------------------------
const EventForm = ({ event, onSubmit, onCancel }) => {
  const { language } = useAuth();
  const t = ui[language] ?? ui.en;
  const ev = t.events;

  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date ? (typeof event.date === 'string' ? event.date : event.date.toISOString().split('T')[0]) : '',
    location: event?.location || '',
    organizer: event?.organizer || '',
    url: event?.url || '',
    isPublic: event?.isPublic !== false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, date: formData.date });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium">{event ? ev.form.editTitle : ev.form.addTitle}</h3>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">{ev.form.titleField}</label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">{ev.form.date}</label>
        <input
          type="date"
          id="date"
          name="date"
          required
          value={formData.date}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">{ev.form.location}</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="organizer" className="block text-sm font-medium text-gray-700">{ev.form.organizer}</label>
        <input
          type="text"
          id="organizer"
          name="organizer"
          value={formData.organizer}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">{ev.form.websiteUrl}</label>
        <input
          type="url"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={formData.isPublic}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
          {ev.form.isPublic}
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          {ev.form.cancel}
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {event ? ev.form.update : ev.form.add}
        </button>
      </div>
    </form>
  );
};

// -------------------------------------------
// EventManagement sub-component
// -------------------------------------------
const EventManagement = () => {
  const { language } = useAuth();
  const t = ui[language] ?? ui.en;
  const ev = t.events;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await eventsManagementService.getAllEvents();
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(ev.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (eventData) => {
    try {
      await eventsManagementService.addEvent(eventData);
      await fetchEvents();
      setIsFormVisible(false);
      setCurrentEvent(null);
    } catch (err) {
      console.error('Error adding event:', err);
      setError(ev.addError);
    }
  };

  const handleUpdateEvent = async (eventData) => {
    try {
      await eventsManagementService.updateEvent(currentEvent.id, eventData);
      await fetchEvents();
      setIsFormVisible(false);
      setCurrentEvent(null);
    } catch (err) {
      console.error('Error updating event:', err);
      setError(ev.updateError);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm(ev.deleteConfirm)) {
      try {
        await eventsManagementService.removeEvent(eventId);
        await fetchEvents();
      } catch (err) {
        console.error('Error deleting event:', err);
        setError(ev.deleteError);
      }
    }
  };

  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setIsFormVisible(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">{error}</div>
      </div>
    );
  }

  if (isFormVisible) {
    return (
      <EventForm
        event={currentEvent}
        onSubmit={currentEvent ? handleUpdateEvent : handleAddEvent}
        onCancel={() => {
          setIsFormVisible(false);
          setCurrentEvent(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{ev.manageEvents}</h2>
        <button
          onClick={() => {
            setCurrentEvent(null);
            setIsFormVisible(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {ev.addNewEvent}
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{ev.noEvents}</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{ev.table.date}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{ev.table.title}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{ev.table.location}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{ev.table.status}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{ev.table.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.date instanceof Date
                      ? event.date.toLocaleDateString()
                      : event.date ? new Date(event.date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    {event.organizer && (
                      <div className="text-sm text-gray-500">By: {event.organizer}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{event.location || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.isPublic ? ev.table.public : ev.table.private}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      {ev.table.edit}
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {ev.table.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------
// Main Events component
// -------------------------------------------
const Events = ({ isAdmin = false }) => {
  const { user, language } = useAuth();
  const t = ui[language] ?? ui.en;
  const ev = t.events;

  const [publicEvents, setPublicEvents] = useState([]);
  const [communityProjects, setCommunityProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('timeline');

  const userIsAdmin = isAdmin || (user && user.role === 'admin');
  const canAccessForum = user && (user.role === 'member' || user.role === 'validator' || user.role === 'admin');

  useEffect(() => {
    if (view === 'timeline') {
      fetchTimelineData();
    }
  }, [view]);

  const fetchTimelineData = async () => {
    try {
      setIsLoading(true);

      const events = await eventsManagementService.getPublicEvents();
      setPublicEvents(events || []);

      try {
        const projects = await projetManagementService.getProjets();
        const validProjects = Array.isArray(projects) ? projects.filter(project => {
          const hasEndDate = project && (project.timeline?.endDate || project.endDate);
          const isNotDraft = project && project.status?.current && project.status.current !== 'draft';
          return hasEndDate && isNotDraft;
        }) : [];
        setCommunityProjects(validProjects);
      } catch (projectError) {
        console.error("Error retrieving projects:", projectError);
        setCommunityProjects([]);
      }
    } catch (error) {
      console.error("Error retrieving timeline data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimelineEvents = () => {
    if (!publicEvents.length && !communityProjects.length) return [];

    const allEvents = [
      ...publicEvents.map(event => ({ ...event, isProject: false })),
      ...(Array.isArray(communityProjects) ? communityProjects.map(project => {
        const endDate = project.timeline?.endDate || project.endDate;
        return {
          id: project.id,
          title: project.title || "Untitled Project",
          date: endDate,
          location: project.location || "",
          isProject: true,
          projectId: project.id,
          status: project.status?.current
        };
      }) : [])
    ];

    return allEvents
      .filter(event => event.date)
      .sort((a, b) => {
        try {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          return dateB - dateA;
        } catch (error) {
          return 0;
        }
      });
  };

  const toggleView = () => {
    setView(view === 'timeline' ? 'manage' : 'timeline');
  };

  const goToForum = () => {
    window.location.hash = 'forum';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12 mt-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900 text-center mb-6">
          {ev.sectionTitle}
        </h2>

        <div className="flex justify-between">
          <div className="flex-1">
            {userIsAdmin && (
              <div className="flex justify-start">
                <button
                  onClick={toggleView}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
                >
                  {view === 'timeline' ? (
                    <>
                      <PlusCircle className="h-4 w-4 mr-1" />
                      <span>{ev.manageEvents}</span>
                    </>
                  ) : (
                    <span>{ev.viewTimeline}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 text-center" />

          <div className="flex-1">
            {canAccessForum && (
              <div className="flex justify-end">
                <button
                  onClick={goToForum}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center space-x-1"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  <span>{ev.addProject}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {view === 'manage' && userIsAdmin ? (
        <EventManagement />
      ) : (
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="relative space-y-12">
              {getTimelineEvents().length > 0 ? (
                getTimelineEvents().map((event) => (
                  <TimelineEvent
                    key={event.id || `event-${event.title}-${event.date}`}
                    date={event.date}
                    title={event.title}
                    location={event.location}
                    organizer={event.organizer}
                    url={event.url}
                    isProject={event.isProject}
                    projectId={event.projectId}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">{ev.noEvents}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;
