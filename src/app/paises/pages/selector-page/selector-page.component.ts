import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaisSmall } from '../../interfaces/paises.interface';
import { PaisesService } from '../../services/paises.service';
import { delay, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  miFormulario: FormGroup = this.fb.group({
    region: ['', Validators.required],
    pais: ['', Validators.required],
    frontera: ['', Validators.required]
  })

  // llenar selectores
  regiones: string[] = [];
  paises: PaisSmall[] = [];
  fronteras: string[] = [];

  cargando: boolean = false;

  constructor( private fb: FormBuilder,
               private paisesService: PaisesService ) { }

  ngOnInit(): void {
    this.regiones = this.paisesService.regiones;

    //Obtener valor cuando cambie la región:
      // this.miFormulario.get('region')?.valueChanges
      //   .subscribe( region => {
      //     this.paisesService.getPaisesPorRegion(region)
      //       .subscribe( paises => { this.paises = paises; })
      //   }) Esto es igual que (sin la parte del tap):
    this.miFormulario.get('region')?.valueChanges
      .pipe(
        // (_) nomenclatura que indica que no interesa lo que recibe, también vale ()
        tap( (_) =>{
          this.miFormulario.get('pais')?.reset('');
          this.cargando = true;
        } ),
        switchMap( region => this.paisesService.getPaisesPorRegion(region) )
      ).pipe(delay(500)).subscribe ( paises => {
        this.paises = paises;
        this.cargando = false;
      } );

    // Obtener valor cuando cambie el país:
    this.miFormulario.get('pais')?.valueChanges
      .pipe(
        tap( () => {
          this.fronteras = [];
          this.miFormulario.get('frontera')?.reset('');
          this.cargando = true;
        }),
        switchMap( codigo => this.paisesService.getPaisPorCodigo( codigo ))
      ).subscribe( pais => {
        this.fronteras = pais?.borders || [];
        this.cargando = false;
      });

  }

  guardar(){
    console.log(this.miFormulario.value.region);
  }

}
