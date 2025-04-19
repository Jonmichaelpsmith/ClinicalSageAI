/**
 * Event Bus Utility
 * 
 * This module provides an in-process event bus for publishing events across services.
 * Simple implementation that works well for single-instance deployments.
 */

// In-process subscribers
const LOCAL_SUBSCRIBERS = new Map();

/**
 * Publish an event to subscribers
 * 
 * @param {string} channel Event channel name
 * @param {object} message Event data (must be JSON-serializable)
 * @returns {boolean} Success status
 */
export async function publish(channel, message) {
  if (!channel || typeof channel !== 'string') {
    console.error('Invalid channel name');
    return false;
  }

  // Process local subscribers
  let success = false;
  const subscribers = LOCAL_SUBSCRIBERS.get(channel);
  if (subscribers && subscribers.length > 0) {
    for (const callback of subscribers) {
      try {
        callback(message);
        success = true;
      } catch (error) {
        console.error('Local subscriber error:', error);
      }
    }
  }

  return success;
}

/**
 * Subscribe to a channel
 * 
 * @param {string} channel Channel to subscribe to 
 * @param {Function} callback Function to call on events
 * @returns {boolean} Success status
 */
export function subscribe(channel, callback) {
  if (!channel || typeof channel !== 'string' || typeof callback !== 'function') {
    console.error('Invalid channel or callback');
    return false;
  }

  if (!LOCAL_SUBSCRIBERS.has(channel)) {
    LOCAL_SUBSCRIBERS.set(channel, []);
  }
  
  LOCAL_SUBSCRIBERS.get(channel).push(callback);
  console.log(`Subscribed to local events on channel: ${channel}`);
  
  return true;
}

/**
 * Unsubscribe from channel
 * 
 * @param {string} channel Channel to unsubscribe from
 * @param {Function} callback Optional specific callback to remove (removes all if null)
 * @returns {boolean} Success status
 */
export function unsubscribe(channel, callback = null) {
  if (!LOCAL_SUBSCRIBERS.has(channel)) {
    return false;
  }

  if (callback === null) {
    LOCAL_SUBSCRIBERS.set(channel, []);
    return true;
  }

  const subscribers = LOCAL_SUBSCRIBERS.get(channel);
  const index = subscribers.indexOf(callback);
  
  if (index !== -1) {
    subscribers.splice(index, 1);
    return true;
  }
  
  return false;
}

export default {
  publish,
  subscribe,
  unsubscribe
};