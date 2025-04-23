import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

interface InstagramMedia {
  id: number;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  postUrl: string;
}

@Component({
  selector: 'app-instagram-feed',
  imports: [CommonModule],
  templateUrl: './instagram-feed.component.html',
  styleUrls: ['./instagram-feed.component.css']
})
export class InstagramFeedComponent implements OnInit, OnDestroy {
  currentIndex = 0;
  private intervalId: any;

  mediaItems: InstagramMedia[] = [
    {
      id: 1,
      imageUrl: '../../assets/instagram_1.png',
      caption: 'Précision. Puissance. Adrénaline. Qui est prêt à relever le défi du lancer de hache ? 🎯🪓 #AxeThrowing #PrecisionGame',
      likes: 234,
      comments: 12,
      postUrl: 'https://www.instagram.com/p/example1/'
    },
    {
      id: 2,
      imageUrl: '../../assets/instagram_2.png',
      caption: 'Bullseye ! Rien de plus satisfaisant que de voir sa hache atteindre la cible parfaite. Qui d’autre vise la perfection ? 💥🪓 #HitTheBullseye #AxeThrowingVibes',
      likes: 187,
      comments: 8,
      postUrl: 'https://www.instagram.com/p/example2/'
    },
    {
      id: 3,
      imageUrl: '../../assets/instagram_3.png',
      caption: 'Lancer de hache = adrénaline + fun ! Qui veut une revanche ? 😏🔥 #SquadGoals #AxeThrowingNight',
      likes: 342,
      comments: 15,
      postUrl: 'https://www.instagram.com/p/example3/'
    }
  ];

  ngOnInit(): void {
    this.startAutoScroll();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startAutoScroll(): void {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.mediaItems.length;
    }, 3000);
  }

  setCurrentIndex(index: number): void {
    this.currentIndex = index;
    // Reset the interval when manually changing slides
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.startAutoScroll();
  }

  getPreviousIndex(): number {
    return (this.currentIndex - 1 + this.mediaItems.length) % this.mediaItems.length;
  }

  getNextIndex(): number {
    return (this.currentIndex + 1) % this.mediaItems.length;
  }
}