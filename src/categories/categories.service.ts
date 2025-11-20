import { Injectable } from '@nestjs/common';

export interface Category {
  id: string;
  name: string;
  description: string;
}

@Injectable()
export class CategoriesService {
  private readonly categories: Category[] = [
    {
      id: 'entertainment',
      name: 'Entertainment',
      description: 'Netflix, Spotify, YouTube Premium',
    },
    {
      id: 'productivity',
      name: 'Productivity',
      description: 'Notion, Microsoft 365, Slack',
    },
    {
      id: 'cloud-storage',
      name: 'Cloud Storage',
      description: 'iCloud, Google Drive, Dropbox',
    },
    {
      id: 'gaming',
      name: 'Gaming',
      description: 'PlayStation Plus, Xbox Game Pass',
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Coursera, Udemy, Skillshare',
    },
    {
      id: 'news-media',
      name: 'News & Media',
      description: 'Medium, NYTimes, The Athletic',
    },
    {
      id: 'health-fitness',
      name: 'Health & Fitness',
      description: 'Peloton, MyFitnessPal, Nike+',
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Bank xidmətləri, Investment apps',
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Zoom Pro, WhatsApp Business',
    },
    {
      id: 'shopping',
      name: 'Shopping',
      description: 'Amazon Prime, Delivery apps',
    },
    {
      id: 'ai-tools',
      name: 'AI Tools',
      description: 'ChatGPT Plus, Jasper, Midjourney',
    },
    {
      id: 'other',
      name: 'Digər',
      description: 'Başqa xidmətlər',
    },
  ];

  getAllCategories(): Category[] {
    return this.categories;
  }
}

