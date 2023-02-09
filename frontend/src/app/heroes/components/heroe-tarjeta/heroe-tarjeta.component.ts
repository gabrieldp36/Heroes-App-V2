import { Component, ElementRef, Input, ViewChild, OnInit } from '@angular/core';
import { Heroe } from '../../interfaces/heroes.interfaces';
import { HeroesService } from '../../services/heroes.service';

@Component({
  selector: 'app-heroe-tarjeta',
  templateUrl: './heroe-tarjeta.component.html',
  styles: [
    `
      mat-card{
        margin-top: 25px;
        padding-bottom: 25px;
      }
    `
  ]
})
export class HeroeTarjetaComponent implements OnInit {
  @ViewChild('imagen') imagenHeroe!:ElementRef<HTMLImageElement>;
  @Input() heroe!: Heroe;
  @Input() adminUser!: boolean;
  public heroesPropios: number[] = [];
  public imgLoad: boolean = false;

  constructor(private heroesService: HeroesService) {};

  public ngOnInit(): void {
    this.heroesService.getHeroesPropiosIds().subscribe( (heroesIds) => {
      this.heroesPropios = heroesIds;
    });
  };

  public esHeroePropio(id:number): boolean {
    return this.heroesPropios.includes(id);
  };

  public imagenError(): void {
    this.imagenHeroe.nativeElement.src = 'assets/no-image.png';
  };

  public onLoadImg(): void {
    this.imgLoad = true;
  };
};
