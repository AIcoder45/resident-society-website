#!/usr/bin/env node

/**
 * Content Template Generator
 * Usage: node scripts/generate-content.js <type> <title>
 * 
 * Example: node scripts/generate-content.js news "New Playground"
 */

const fs = require('fs');
const path = require('path');

const types = {
  news: {
    file: path.join(__dirname, '../src/data/news.json'),
    template: {
      id: '',
      title: '',
      slug: '',
      shortDescription: '',
      content: '',
      image: '/images/news/.jpg',
      category: 'Announcements',
      publishedAt: new Date().toISOString(),
    },
  },
  event: {
    file: path.join(__dirname, '../src/data/events.json'),
    template: {
      id: '',
      title: '',
      slug: '',
      description: '',
      eventDate: new Date().toISOString(),
      location: '',
      coverImage: '/images/events/.jpg',
      gallery: [],
    },
  },
  notification: {
    file: path.join(__dirname, '../src/data/notifications.json'),
    template: {
      id: '',
      title: '',
      message: '',
      priority: 'normal',
      expiryDate: null,
      createdAt: new Date().toISOString(),
    },
  },
  gallery: {
    file: path.join(__dirname, '../src/data/gallery.json'),
    template: {
      id: '',
      title: '',
      description: '',
      images: [],
      eventId: null,
      createdAt: new Date().toISOString(),
    },
  },
  policy: {
    file: path.join(__dirname, '../src/data/policies.json'),
    template: {
      id: '',
      title: '',
      description: '',
      file: '/documents/.pdf',
      category: 'Rules & Regulations',
      updatedAt: new Date().toISOString(),
    },
  },
};

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getNextId(data) {
  if (data.length === 0) return '1';
  const maxId = Math.max(...data.map(item => parseInt(item.id) || 0));
  return (maxId + 1).toString();
}

function main() {
  const [type, ...titleParts] = process.argv.slice(2);
  const title = titleParts.join(' ');

  if (!type || !title) {
    console.error('Usage: node scripts/generate-content.js <type> <title>');
    console.error('\nTypes: news, event, notification, gallery, policy');
    console.error('Example: node scripts/generate-content.js news "New Playground Installed"');
    process.exit(1);
  }

  const config = types[type.toLowerCase()];
  if (!config) {
    console.error(`Unknown type: ${type}`);
    console.error('Available types:', Object.keys(types).join(', '));
    process.exit(1);
  }

  // Read existing data
  const existingData = JSON.parse(fs.readFileSync(config.file, 'utf-8'));
  
  // Generate new entry
  const slug = generateSlug(title);
  const id = getNextId(existingData);
  
  const newEntry = {
    ...config.template,
    id,
    title,
    slug,
  };

  // Add to array
  existingData.push(newEntry);

  // Write back to file
  fs.writeFileSync(
    config.file,
    JSON.stringify(existingData, null, 2) + '\n',
    'utf-8'
  );

  console.log(`✅ Created new ${type} entry:`);
  console.log(`   ID: ${id}`);
  console.log(`   Title: ${title}`);
  console.log(`   Slug: ${slug}`);
  console.log(`\n📝 Edit ${config.file} to add more details.`);
}

main();




