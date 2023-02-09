import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../../auth/services/auth.service';
import { HeroesService } from '../../services/heroes.service';
import { ConfirmarComponent } from '../../components/confirmar/confirmar.component';
import { RellenarCamposComponent } from '../../components/rellenar-campos/rellenar-campos.component';
import { HeroeErrorComponent } from '../../components/heroe-error/heroe-error.component';
import { Publisher, Publishers, Heroe } from '../../interfaces/heroes.interfaces';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.component.html',
  styles: [
    `
      img {
        width: 400px;
        max-width: 100%;
        border-radius: 20px;
        box-shadow: 4px 4px 4px 5px rgba(0.21, 0.21, 0.21, 0.21), 4px 4px 4px 4px rgba(0.24, 0.24, 0.24, 0.24);
        height: 500px;
      }
    `
  ]
})
export class AgregarComponent implements OnInit {

  @ViewChild('imagen') imagenHeroe!:ElementRef<HTMLImageElement>;
  public srcImg: string = '';
  public publishers: Publishers[] = [
    {
      id: 'DC Comics',
      desc:'DC - Comics',
    },
    {
      id: 'Marvel Comics',
      desc:'Marvel - Comics',
    },      
  ];
  public heroe:Heroe = {
    id: 0,
    superhero: '',
    alter_ego: '',
    first_appearance: '',
    characters: '',
    publisher: Publisher.DCComics,
    habilities: '',
    alt_img: '',
    assets_img: false,
    id_usuario: 0,
  };
  public adminUser: boolean = false;
  public heroesPropios: number[] = []

  constructor(
    private authService: AuthService,
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snakBar: MatSnackBar,
    private dialog: MatDialog,
  ) {};

  ngOnInit(): void {
    this.configurarRuta();
  };

  public configurarRuta(): void {
    if ( !this.router.url.includes('editar') ) { 
      this.heroesService.obtenerUsuarioActualizado().subscribe();
    } else {
      this.determinarPermanencia();
      this.activatedRoute.params
      .pipe( switchMap ( ({id})  => this.heroesService.getHeroesPorId(id) ) )
      .subscribe( 
        (heroe) => {
          this.heroe = heroe
        },
      );
    };
  };

  // Validar permanencia en la ruta.

  public esHeroePropio(id:number): boolean {
    return this.heroesPropios.includes(id);
  };

  public determinarPermanencia(): void {
    this.heroesService.getHeroesPropiosIds().subscribe( (heroesIds) => {
      this.heroesPropios = heroesIds;
      this.heroesService.obtenerUsuarioActualizado().subscribe( (_) => {
        if(this.authService.auth.admin) {
          this.adminUser = this.authService.auth.admin;
        };
        this.activatedRoute.params.subscribe( ({id}) => {
          if( !(this.adminUser || this.esHeroePropio(id*1)) ) {
            this.router.navigate(['heroes/listado']);
          };
        });
      });
    });
  };

  // Agregar - Editar - Eliminar Héroes.

  public agregarEditar(): void {
    // Validaciones campos formulario.
    if ( (this.heroe.superhero?.trim().length || 0) === 0 ) {
      this.dialog.open(RellenarCamposComponent);
      return;
    } else if ( (this.heroe.alter_ego?.trim().length || 0) === 0 ) {
      this.dialog.open(RellenarCamposComponent);
      return;
    } else if ( (this.heroe.habilities?.trim().length || 0) === 0 ) {
      this.dialog.open(RellenarCamposComponent);
      return;
    };
    if (this.heroe.id) {
      // Actualizar héroe.
      this.heroesService.actualizarHeroe(this.heroe)
      .subscribe( heroe => {
        this.router.navigate(['heroes/', heroe.id]);
      });
    } else {
      // Crear héroe.
      this.heroe.id_usuario = this.authService.auth.id
      this.heroesService.agregarHeroe(this.heroe)
      .subscribe( {
        next: (heroe) => {
          this.router.navigate(['heroes/editar', heroe.id]);
          this.mostrarSnackBar('Héroe creado con éxito!');
        },
        error: (err) => {
          this.dialog.open(HeroeErrorComponent, {data:err.error.msg});
        }
      })
    };
  };

  // Borrar héroe.

  borrarHeroe(): void {
    const dialog = this.dialog.open(ConfirmarComponent, {
      width: '300px',
      panelClass:['dialogConfirm'],
      data: {...this.heroe},
    });
    dialog.afterClosed()
    .pipe( switchMap( (result) => (result) ? this.heroesService.borrarHeroe(this.heroe.id!) : of(false) ) )
    .subscribe( resp => {
      if (resp !== false) {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });
        Toast.fire({
          icon: 'success',
          title: '¡Héroe eliminado!',
          color: '#fff',
          background: '#323232',
        });
        this.router.navigate(['heroes/listado']);
      };
    });
  };

  imagenError(): void {
    this.imagenHeroe.nativeElement.src = 'assets/no-image.png';
  };

  mostrarSnackBar (mensaje:string): void {
    this.snakBar.open( mensaje, 'Cerrar', {duration: 2000, panelClass: ['snakBarGuardar']} );
  };
};
