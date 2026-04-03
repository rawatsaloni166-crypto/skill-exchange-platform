import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../src/config';
import User from '../src/models/User';
import Request from '../src/models/Request';
import Message from '../src/models/Message';
import Review from '../src/models/Review';
import Flag from '../src/models/Flag';

async function seed() {
  // WARNING: This script is for development only. Never run against production databases.
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');
  
  await User.deleteMany({});
  await Request.deleteMany({});
  await Message.deleteMany({});
  await Review.deleteMany({});
  await Flag.deleteMany({});
  
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  await User.create({
    email: 'admin@example.com',
    password: adminPassword,
    displayName: 'Admin',
    role: 'admin',
    bio: '',
    location: '',
    avatarUrl: '',
    skillsOffered: [],
    skillsWanted: [],
  });
  
  const userPassword = await bcrypt.hash('User123!', 12);
  
  const alice = await User.create({
    email: 'alice@example.com',
    password: userPassword,
    displayName: 'Alice',
    skillsOffered: ['JavaScript', 'React'],
    skillsWanted: ['Python', 'Data Science'],
    bio: 'Full-stack developer',
    location: 'San Francisco',
    role: 'user',
    avatarUrl: '',
  });
  
  const bob = await User.create({
    email: 'bob@example.com',
    password: userPassword,
    displayName: 'Bob',
    skillsOffered: ['Python', 'Machine Learning'],
    skillsWanted: ['JavaScript', 'React'],
    bio: 'Data scientist',
    location: 'New York',
    role: 'user',
    avatarUrl: '',
  });
  
  const carol = await User.create({
    email: 'carol@example.com',
    password: userPassword,
    displayName: 'Carol',
    skillsOffered: ['Graphic Design', 'Figma'],
    skillsWanted: ['Marketing', 'SEO'],
    bio: 'UI/UX Designer',
    location: 'Austin',
    role: 'user',
    avatarUrl: '',
  });
  
  const dave = await User.create({
    email: 'dave@example.com',
    password: userPassword,
    displayName: 'Dave',
    skillsOffered: ['Marketing', 'SEO'],
    skillsWanted: ['Graphic Design', 'Video Editing'],
    bio: 'Digital marketer',
    location: 'Chicago',
    role: 'user',
    avatarUrl: '',
  });
  
  const aliceBobRequest = await Request.create({
    fromUser: alice._id,
    toUser: bob._id,
    skillOffered: 'JavaScript',
    skillWanted: 'Python',
    message: 'Hi Bob, I would love to exchange skills with you!',
    status: 'accepted',
  });
  
  await Request.create({
    fromUser: bob._id,
    toUser: carol._id,
    skillOffered: 'Python',
    skillWanted: 'Graphic Design',
    message: 'Hi Carol, I need help with design!',
    status: 'pending',
  });
  
  const carolDaveRequest = await Request.create({
    fromUser: carol._id,
    toUser: dave._id,
    skillOffered: 'Graphic Design',
    skillWanted: 'Marketing',
    message: 'Hi Dave, let us exchange skills!',
    status: 'completed',
  });
  
  await Message.create({
    request: aliceBobRequest._id,
    sender: alice._id,
    body: 'Hi Bob! Excited to start our skill exchange.',
  });
  
  await Message.create({
    request: aliceBobRequest._id,
    sender: bob._id,
    body: "Great! Let's begin with some Python basics.",
  });
  
  await Review.create({
    request: carolDaveRequest._id,
    reviewer: carol._id,
    reviewee: dave._id,
    rating: 5,
    comment: 'Dave is an excellent marketing mentor!',
  });
  
  await Review.create({
    request: carolDaveRequest._id,
    reviewer: dave._id,
    reviewee: carol._id,
    rating: 4,
    comment: "Carol's design skills are impressive.",
  });
  
  await User.findByIdAndUpdate(dave._id, { averageRating: 5, reviewCount: 1 });
  await User.findByIdAndUpdate(carol._id, { averageRating: 4, reviewCount: 1 });
  
  console.log('Seed completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
