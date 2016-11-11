
let hasOwnProperty = function(obj, prop){
      try {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }
      catch (e) {
        return (prop in obj);
      }
    },
    addListener = function() {};
if(!!window.google) { addListener = google.maps.event.addListener };

export default function registerEvents(eventList, handlers, instance) {
  const registeredEvents = eventList.reduce((acc, eventName) => {
    const onEventName = `on${eventName}`;

    if (hasOwnProperty(handlers, onEventName)) {
      acc.push(addListener(instance, eventName, handlers[onEventName]));
    }

    return acc;
  }, []);

  return registeredEvents;
}
