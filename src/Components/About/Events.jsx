import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ExternalLink, Globe, Users } from 'lucide-react';
import { eventsManagementService } from '../../services/eventsManagement';
import { projetManagementService } from '../../services/projectManagement';
import { useAuth } from '../AuthContext';

// TimelineEvent component for rendering individual events
const TimelineEvent = ({ date, title, location, organizer, url, isProject = false }) => {
  // Ensure date is properly formatted
  let formattedDate = 'Date undefined';

  if (date) {
    if (typeof date === 'string') {
      formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (date instanceof Date) {
      formattedDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      // If it's a Firestore timestamp or another format
      try {
        formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } catch (error) {
        console.error("Date formatting error:", error, date);
      }
    }
  }

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
                  <span className="mr-1">More info</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <div className="relative flex flex-col items-center w-[10%]">
            <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-orange-300 to-orange-500" 
                 style={{ transform: 'translateY(-50%)', height: 'calc(100% + 80px)' }}>
            </div>
            <div className="relative w-4 h-4 bg-orange-500 rounded-full border-4 border-orange-200 z-10 
                          transition-all duration-200 group-hover:scale-150 group-hover:border-orange-100">
            </div>
          </div>
          <div className="w-[45%]"></div>
        </>
      ) : (
        <>
          <div className="w-[45%]"></div>
          <div className="relative flex flex-col items-center w-[10%]">
            <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-300 to-emerald-500"
                 style={{ transform: 'translateY(-50%)', height: 'calc(100% + 80px)' }}>
            </div>
            <div className="relative w-4 h-4 bg-emerald-500 rounded-full border-4 border-emerald-200 z-10 
                          transition-all duration-200 group-hover:scale-150 group-hover:border-emerald-100">
            </div>
          </div>
          <div className="w-[45%] pl-8">
            <div className="group-hover:transform group-hover:scale-105 transition-transform">
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
                  Community Project
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Event form component for adding/editing events
const EventForm = ({ event, onSubmit, onCancel }) => {
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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date: formData.date // Date string in ISO format
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium">{event ? 'Edit Event' : 'Add New Event'}</h3>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title*</label>
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
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date*</label>
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
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
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
        <label htmlFor="organizer" className="block text-sm font-medium text-gray-700">Organizer</label>
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
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">Website URL</label>
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
          Public Event (visible on timeline)
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {event ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
};

// Event Management Component
const EventManagement = () => {
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
      console.log("Events retrieved:", eventsData); // Debug logging
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
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
      setError('Failed to add event. Please try again.');
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
      setError('Failed to update event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsManagementService.removeEvent(eventId);
        await fetchEvents();
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Failed to delete event. Please try again.');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        <h2 className="text-xl font-semibold">Manage Events</h2>
        <button
          onClick={() => {
            setCurrentEvent(null);
            setIsFormVisible(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Event
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No events found. Add your first event using the button above.</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      {event.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
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

// Main Events Timeline Component
const Events = ({ isAdmin = false }) => {
  const [publicEvents, setPublicEvents] = useState([]);
  const [communityProjects, setCommunityProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('timeline'); // 'timeline' or 'manage'
  const { user } = useAuth();

  // Check if user is admin
  const userIsAdmin = isAdmin || (user && user.role === 'admin');

  useEffect(() => {
    if (view === 'timeline') {
      fetchTimelineData();
    }
  }, [view]);

  const fetchTimelineData = async () => {
    try {
      setIsLoading(true);

      // Fetch public events
      console.log("Fetching public events...");
      const events = await eventsManagementService.getPublicEvents();
      console.log("Public events retrieved:", events);
      setPublicEvents(events || []);

      // Fetch community projects
      console.log("Fetching projects...");
      try {
        const projects = await projetManagementService.getProjets();
        console.log("Raw projects data:", projects);

        // Filter projects that have an endDate and are not in draft status
        const validProjects = Array.isArray(projects) ? projects.filter(project => {
          // Check if we have an endDate (either in timeline object or directly)
          const hasEndDate = project && (
            project.timeline?.endDate || 
            project.endDate
          );

          // Check if the project status is not draft
          const isNotDraft = project && 
            project.status?.current && 
            project.status.current !== 'draft';

          return hasEndDate && isNotDraft;
        }) : [];

        console.log("Valid projects for timeline:", validProjects);
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

  // Combine and sort all timeline events by date
  const getTimelineEvents = () => {
    console.log("Generating timeline with:", 
                publicEvents.length, "events and", 
                communityProjects.length, "projects");

    // If no events are available, return an empty array
    if (!publicEvents.length && !communityProjects.length) {
      return [];
    }

    const allEvents = [
      ...publicEvents.map(event => ({
        ...event,
        isProject: false
      })),
      ...(Array.isArray(communityProjects) ? communityProjects.map(project => {
        // Get the endDate from timeline object or directly from project
        const endDate = project.timeline?.endDate || project.endDate;

        return {
          id: project.id,
          title: project.title || "Untitled Project",
          date: endDate, // Use only endDate for the timeline
          location: project.location || "",
          isProject: true,
          status: project.status?.current
        };
      }) : [])
    ];

    console.log("Combined events before sorting:", allEvents);

    // Sort by date while avoiding errors for invalid dates
    const sortedEvents = allEvents
      .filter(event => event.date) // Filter out events without dates
      .sort((a, b) => {
        try {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          if (isNaN(dateA.getTime())) {
            console.warn("Invalid date A:", a.date, a);
            return 1; // Place at the end
          }

          if (isNaN(dateB.getTime())) {
            console.warn("Invalid date B:", b.date, b);
            return -1; // Place at the end
          }

          return dateB - dateA; // Most recent first
        } catch (error) {
          console.error("Error during date sorting:", error, a, b);
          return 0;
        }
      });

    console.log("Sorted events:", sortedEvents);
    return sortedEvents;
  };

  const toggleView = () => {
    setView(view === 'timeline' ? 'manage' : 'timeline');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {userIsAdmin && (
        <div className="mb-6 flex justify-end">
          <button 
            onClick={toggleView}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {view === 'timeline' ? 'Manage Events' : 'View Timeline'}
          </button>
        </div>
      )}

      {view === 'manage' && userIsAdmin ? (
        <EventManagement />
      ) : (
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-12 text-center">
            Our Journey & Milestones
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No events or projects to display. Add events using the "Manage Events" button.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;