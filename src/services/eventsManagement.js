// =============== EVENTS MANAGEMENT SERVICE ===============
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase'; // Assuming your firebase.js exports db

export const eventsManagementService = {
  async addEvent(eventData) {
    if (!eventData || !eventData.title || !eventData.date) {
      throw new Error('Invalid event data: title and date are required');
    }

    try {
      console.log('Adding new event to Firestore:', eventData);
      const eventsRef = collection(db, 'events');

      // Convert date to Timestamp if it's a string
      let eventDate;
      if (typeof eventData.date === 'string') {
        eventDate = new Date(eventData.date);
      } else if (eventData.date instanceof Date) {
        eventDate = eventData.date;
      } else {
        throw new Error('Invalid date format');
      }

      const newEvent = {
        title: eventData.title,
        date: Timestamp.fromDate(eventDate),
        location: eventData.location || '',
        organizer: eventData.organizer || '',
        url: eventData.url || '',
        isPublic: eventData.isPublic !== false, // Default to public
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(eventsRef, newEvent);
      console.log('Event added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding event to Firestore:', error);
      throw new Error(`Failed to add event: ${error.message}`);
    }
  },

  async updateEvent(eventId, eventData) {
    if (!eventId || !eventData) {
      throw new Error('Event ID and event data are required');
    }

    try {
      console.log('Updating event:', { eventId, eventData });
      const eventRef = doc(db, 'events', eventId);

      // Prepare the data to update
      const updateData = { ...eventData, updatedAt: serverTimestamp() };

      // Convert date to Timestamp if present
      if (eventData.date) {
        let eventDate;
        if (typeof eventData.date === 'string') {
          eventDate = new Date(eventData.date);
        } else if (eventData.date instanceof Date) {
          eventDate = eventData.date;
        } else {
          throw new Error('Invalid date format');
        }
        updateData.date = Timestamp.fromDate(eventDate);
      }

      await updateDoc(eventRef, updateData);
      console.log('Event updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error(`Failed to update event: ${error.message}`);
    }
  },

  async getAllEvents() {
    try {
      console.log('Fetching all events');
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef);
      const snapshot = await getDocs(q);
      const events = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Safely handle date conversions
        let eventDate = null;
        if (data.date) {
          try {
            // Check if it's a Firestore Timestamp
            if (data.date.toDate && typeof data.date.toDate === 'function') {
              eventDate = data.date.toDate();
            } else if (typeof data.date === 'string') {
              // If it's a string date
              eventDate = new Date(data.date);
            } else if (data.date.seconds && data.date.nanoseconds) {
              // If it's a Firestore timestamp-like object
              eventDate = new Date(data.date.seconds * 1000);
            }
          } catch (e) {
            console.error("Error converting date:", e);
          }
        }

        events.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : null,
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : null,
          date: eventDate
        });
      });

      // Sort client-side
      events.sort((a, b) => {
        const dateA = a.date || new Date(0);
        const dateB = b.date || new Date(0);
        return dateB - dateA;
      });

      console.log(`Found ${events.length} events`);
      return events;
    } catch (error) {
      console.error('Error getting all events:', error);
      throw new Error(`Failed to get all events: ${error.message}`);
    }
  },

  async getPublicEvents() {
    try {
      console.log('Fetching public events');
      const eventsRef = collection(db, 'events');

      // Query all events and filter client-side
      const q = query(eventsRef);

      const snapshot = await getDocs(q);
      const events = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Safely handle date conversions
        let eventDate = null;
        if (data.date) {
          try {
            // Check if it's a Firestore Timestamp
            if (data.date.toDate && typeof data.date.toDate === 'function') {
              eventDate = data.date.toDate();
            } else if (typeof data.date === 'string') {
              // If it's a string date
              eventDate = new Date(data.date);
            } else if (data.date.seconds && data.date.nanoseconds) {
              // If it's a Firestore timestamp-like object
              eventDate = new Date(data.date.seconds * 1000);
            }
          } catch (e) {
            console.error("Error converting date:", e);
          }
        }

        // Only include public events
        if (data.isPublic === true) {
          events.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : null,
            updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : null,
            date: eventDate
          });
        }
      });

      // Sort client-side by date in descending order
      events.sort((a, b) => {
        const dateA = a.date || new Date(0);
        const dateB = b.date || new Date(0);
        return dateB - dateA;
      });

      console.log(`Found ${events.length} public events`);
      return events;
    } catch (error) {
      console.error('Error getting public events:', error);
      throw new Error(`Failed to get public events: ${error.message}`);
    }
  },

  async removeEvent(eventId) {
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    try {
      console.log('Removing event:', eventId);
      await deleteDoc(doc(db, 'events', eventId));
      console.log('Event removed successfully');
      return true;
    } catch (error) {
      console.error('Error removing event:', error);
      throw new Error(`Failed to remove event: ${error.message}`);
    }
  }
};