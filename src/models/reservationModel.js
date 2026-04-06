import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  expiresAt: {
    type: Date,
    required: true
  }
})

reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('Reservation', reservationSchema)
