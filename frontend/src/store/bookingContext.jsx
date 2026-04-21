import { createContext, useContext, useState } from 'react'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [selectedResource, setSelectedResource] = useState(null)
  const [draftBooking, setDraftBooking] = useState(null)

  const selectResource = (resource) => setSelectedResource(resource)
  const clearDraft     = ()          => { setDraftBooking(null); setSelectedResource(null) }

  return (
    <BookingContext.Provider value={{ selectedResource, draftBooking, setDraftBooking, selectResource, clearDraft }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookingContext() { return useContext(BookingContext) }
export default BookingContext
