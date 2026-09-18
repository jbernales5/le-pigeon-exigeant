"use client"

import { HotelForm, type HotelFormValues } from "@/components/add/hotel-form"
import { deleteHotel, updateHotel } from "@/lib/actions/hotels"

export function EditHotelForm({ hotelId, initial }: { hotelId: string; initial: HotelFormValues }) {
  return (
    <HotelForm
      mode="edit"
      initial={initial}
      candidates={[]}
      onSubmit={(values) => updateHotel(hotelId, values)}
      onDelete={() => deleteHotel(hotelId)}
    />
  )
}
