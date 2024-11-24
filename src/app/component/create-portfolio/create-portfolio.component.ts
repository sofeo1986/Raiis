import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { FormBuilder,FormsModule, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSliderModule } from '@angular/material/slider'; // Import MatSliderModule
import * as Papa from 'papaparse';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select'; // Import if using mat-select
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; // Import if using mat-slide-toggle
import { MatRadioModule } from '@angular/material/radio';  // Import 
import { MatListModule } from '@angular/material/list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


import confetti from 'canvas-confetti'; // Importer la bibliothèque
import { SupaService } from '../../service/supa.service';

@Component({
  selector: 'app-create-portfolio',
  standalone: true,
  imports: [HomeComponent, MatListModule,FormsModule,CommonModule, MatStepperModule, MatInputModule,
    MatButtonModule,MatIconModule, MatTableModule, ReactiveFormsModule, MatFormFieldModule,MatSliderModule,MatOptionModule,MatSelectModule,
    MatSlideToggleModule,MatRadioModule,MatCheckboxModule,MatTooltipModule,MatSnackBarModule ],
  templateUrl: './create-portfolio.component.html',
  styleUrl: './create-portfolio.component.css',
  
  
})
export class CreatePortfolioComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef; // Référence à l'élément input file
  @ViewChild('fileweigh') fileweigh!: ElementRef; // Référence à l'élément input file

  uploadedFile: File | null = null; // Variable pour stocker le fichier uploadé
  indexSelection: any; // Valeur sélectionnée du mat-select
  isFileInputDisabled = false; // Contrôle si l'input file est désactivé
  isButtonAddDisabled=false;
  selectedInstrument: any; // Variable pour stocker l'instrument sélectionné
  showPopup = false; // Gérer l'affichage de la popup
  popupText = new FormControl(''); // Utilisation de FormControl
  userId: string | null = null;
  selectedStrategies: { equalWeight: boolean; minimumVariance: boolean } = {
    equalWeight: false,
    minimumVariance: false
  };
  isLoading = false;
  isLoadingPriceUpload: boolean = false;
  isLoadingWeightUpload: boolean = false;


  isIndexSelected = false;  // pour gérer l'état disabled de l'upload
  isFileUploaded = false;
  isFileWeightUploaded =false;
  formattedDate: string = '';
  timestamp: number = 0;
  uploadId: string = '';
  total2: number=0;
  stepper: any;
  filteredDataToSearch: any;
  isFileWeighDisabled: boolean=false;
  runSimulation() {
    if (this.fourthFormGroup.valid) {
     // console.log("Running simulation with benchmark data:", this.benchmarkWeightsData);
      // Add your simulation logic here.
    } else {
      console.error("Form is invalid, cannot run simulation.");
    }
  }
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup; // Updated form for Step 2
  thirdFormGroup: FormGroup;
  transactionFeeValue: number = 0.01; // Default value for transaction fee
  selectedRangeValue: number = 0.01; // Default value for range
  initialCapitalOptions: number[] = [1000, 5000, 10000, 50000]; // Example values
  fourthFormGroup: FormGroup;
  benchmarkWeightsData: any[] = []; // To hold the uploaded benchmark weights data
  minDate: string | null = null;
  maxDate: string | null = null;
  indexoption: string[] = ['SP500', 'STOXX600', 'SPI','NASDAQ']; // Add this for the dropdown options
  indexSelectionweight:string[] = ['SP500', 'STOXX600', 'SPI','NASDAQ'];
  RebalancingFrequency:string[] = ['weekly', 'monthly', 'quaterly','yearly'];;
  monthlyCash:number[] = [1000, 5000, 10000, 50000];
  isDisabled = true; // Set this to `false` when you want to enable the button
  showTooltip = false;
  addPortfolioItemForm: FormGroup;
  showMessage:boolean = false;
  oldestDate?: string;
  latestDate?: string;
  startDate:string | null = null;
  endtDate:string | null = null;;

previousWeight: number = 0;
periodicRebalancingDisabled = true; 
showCongratulations = false; // Contrôle de l'affichage du message de félicitations
selectedOption: string | null = null;
  
  portfolio:any [] = [ ];
  
  portfolio2 = [
    { ticker: 'AAPL', weight: 0.1 },
    { ticker: 'MSFT', weight: 0.5 },
    { ticker: 'AMZN', weight: 0.2 },
  ];
   totalWeight = 0;
   cashValuse:number=0;
   isAddButtonDisabled: boolean = true; // Initialement, le bouton est désactivé
   instrumentIds: any[] = [];
   filterValue: string = ''; // Nouvelle propriété pour la valeur de filtrage
   filteredInstrumentIds: any[] = []; // Liste filtrée des instruments
 
portfolioForm: FormGroup = new FormGroup({});
isEditing = new Array(this.portfolio.length).fill(false);  // Track editing state
  dataSource: any[] = [];
  displayedColumns: string[] = ['instrument_id', 'price', 'date'];
  instrumentColors: { [key: string]: string } = {};

  dataSourceStep2: any[] = []; // Data for Step 2
  displayedColumnsStep2: string[] = ['instrument_id', 'weight', 'date'];

  constructor(private _formBuilder: FormBuilder,private cd: ChangeDetectorRef,private supabaseService: SupaService,  private snackBar: MatSnackBar,private cdRef: ChangeDetectorRef) {
   // this.cash[0].weight = this.totalWeight;
   this.initializeForm();
   this.calculeCash();
   

    this.firstFormGroup = this._formBuilder.group({
      indexSelection: ['', Validators.required], 
      fileUpload: ['', Validators.required]     
    });
    this.secondFormGroup = this._formBuilder.group({
      indexweight: ['', Validators.required],
      fileUploadStep2: [{ value: '', disabled: this.isDisabled }, Validators.required], // File upload for Step 2 is now required
    });
    this.thirdFormGroup = this._formBuilder.group({
      periodicRebalancing: [true],
      fractionalShares: [false],
      initialCapital: ['', Validators.required],
      monthlyCash: ['', Validators.required],
      rebalancingFrequency: ['', Validators.required],
      transactionFee: [0.01, [Validators.required, Validators.min(0.01), Validators.max(15)]], // Ensure transaction fee is a form control
      startDate: [null],
      endDate: [null]
      

    },
    {
      validators: this.dateRangeValidator // Add custom validator here
    }
  
  );
    this.fourthFormGroup = this._formBuilder.group({
      benchmarkStrategy: this._formBuilder.group({
        equalWeight: [false],
        minimumVariance: [false],
      }),
      benchmarkWeightsFile: [{ value: '', disabled: this.isDisabled }, Validators.required]
    });
    this.portfolioForm = this._formBuilder.group({
      ticker: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(-1), Validators.max(1)]],
    });
    this.addPortfolioItemForm = this._formBuilder.group({
      ticker: [null],
      weight: [null],
    });

     
    this.initializePortfolioForm();
   

    
  }

  validateTickerAndWeight() {
    // Ticker Validation
    const tickerControl = this.addPortfolioItemForm.get('ticker');
    if (tickerControl && tickerControl.touched && !tickerControl.value) {
      tickerControl.setValidators(Validators.required);
    } else if (tickerControl) {
      tickerControl.clearValidators();
    }
    if (tickerControl) {
      tickerControl.updateValueAndValidity();
    }
  
    // Weight Validation
    const weightControl = this.addPortfolioItemForm.get('weight');
    if (weightControl && weightControl.touched && !weightControl.value) {
      weightControl.setValidators(Validators.required);
    } else if (weightControl) {
      weightControl.clearValidators();
    }
    if (weightControl) {
      weightControl.updateValueAndValidity();
    }
  }
  
  
  async ngOnInit(): Promise<void> {
    console.log(this.latestDate)
    this.userId = this.supabaseService.getUserId();

    this.firstFormGroup.get('indexSelection')?.valueChanges.subscribe( async (selectedIndex: string) => {
      this.isIndexSelected = !!selectedIndex; // Si un index est sélectionné
      console.log("Index sélectionné :", this.isIndexSelected); // Log de débogage
      if (this.isIndexSelected) {
        // Si un index est sélectionné, désactiver l'input file
        this.isFileInputDisabled = true;
        this.isFileWeighDisabled = true

      } else {
        // Si aucun index n'est sélectionné, réactiver l'input file
        this.isFileInputDisabled = false;
        this.isFileWeighDisabled = false

      }
      this.updateIndexOptionWeight(selectedIndex);  // Call method to update indexSelectionweight
      this.isEditing = this.portfolio.map(() => false);

    this.instrumentIds = await this.supabaseService.getInstrumentIdsByIndexName(selectedIndex);

    this.filteredDataToSearch=this.instrumentIds;
    

    });


   
    
   
    this.supabaseService.getMinAndMaxDates().then(([minDateRes, maxDateRes]) => {
      if (minDateRes.data && minDateRes.data.length > 0) {
        this.oldestDate = minDateRes.data[0].date;
        console.log("oldestDate:", this.oldestDate); // Ajoutez un log pour vérifier la date
    
        if (this.oldestDate && !isNaN(new Date(this.oldestDate).getTime())) {
          // Assurez-vous que la date est valide avant de la formater
          this.thirdFormGroup.get('startDate')?.setValue(this.formatDate(this.oldestDate));
        } else {
          console.error("oldestDate is invalid");
        }
      }
      if (maxDateRes.data && maxDateRes.data.length > 0) {
        this.latestDate = maxDateRes.data[0].date;
        console.log("latestDate:", this.latestDate); // Ajoutez un log pour vérifier la date
    
        if (this.latestDate && !isNaN(new Date(this.latestDate).getTime())) {
          // Assurez-vous que la date est valide avant de la formater
          this.thirdFormGroup.get('endDate')?.setValue(this.formatDate(this.latestDate));
        } else {
          console.error("latestDate is invalid");
        }
      }
      this.updateDateRangeBasedOnFileWeightUpload();

    });
    
    
    this.thirdFormGroup.get('transactionFee')?.valueChanges.subscribe(value => {
      this.transactionFeeValue = value;

    });

    this.portfolioForm.valueChanges.pipe(
      debounceTime(300) // Debounce to prevent frequent updates
    ).subscribe(() => {
      this.calculeCash(); // Calculate only when necessary
    });


    this.thirdFormGroup.get('periodicRebalancing')?.valueChanges.subscribe(value => {
      console.log('Periodic Rebalancing:', value);
  });

  this.thirdFormGroup.get('fractionalShares')?.valueChanges.subscribe(value => {
      console.log('Fractional Shares:', value);
  });

    
    this.filteredInstrumentIds = this.instrumentIds; // Initialiser avec tous les instruments

    this.initializePortfolioForm(); // Initialize the form controls when component is loaded
    this.initializeForm();
    this.calculeCash();

    

  }


  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    if (start && end && start > end) {
      return { invalidDateRange: true };
      console.log('errur date')
    }
    return null;
  }
  updateDateRangeBasedOnFileWeightUpload(): void {
    if (this.isFileWeightUploaded) {
      this.startDate = this.minDate;
      this.endtDate = this.maxDate;
      console.log('sofiene',this.startDate)
      console.log('sofiene',this.endtDate)

    } else {
      this.startDate = this.oldestDate ||null;
      this.endtDate = this.latestDate ||null;
      console.log('sofiene',this.startDate)
      console.log('sofiene',this.endtDate)
    }
  }
  formatDate(date: any): string {
    console.log("formatting date:", date); // Ajoutez un log pour voir la valeur de `date`
    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) {
      console.error("Invalid date format");
      return ""; // Retourne une chaîne vide si la date est invalide
    }
    const year = formattedDate.getFullYear();
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = formattedDate.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
  
  toggleDisable() {
    this.periodicRebalancingDisabled = !this.periodicRebalancingDisabled;
    const periodicRebalancingControl = this.thirdFormGroup.get('periodicRebalancing');
    if (this.periodicRebalancingDisabled) {
        periodicRebalancingControl?.disable();
    } else {
        periodicRebalancingControl?.enable();
    }
}
  initializePortfolioForm() {
    // Initialize the form group
    this.portfolio.forEach((item:any, index) => {
      this.portfolioForm.addControl(
        `ticker${index}`, 
        this._formBuilder.control(item.ticker, Validators.required)
      );
      this.portfolioForm.addControl(
        `weight${index}`, 
        this._formBuilder.control(item.weight, [
          Validators.required, 
          Validators.min(-1), 
          Validators.max(1)
        ])
      );
    });
    
  }
  updateIndexOptionWeight(selectedIndex: string): void {
    let weightOptions: string[] = [];
  
    switch (selectedIndex) {
      case 'SP500':
        weightOptions = ['SP500'];
        break;
      case 'STOXX600':
        weightOptions = ['STOXX600'];
        break;
      case 'SPI':
        weightOptions = ['SPI'];
        break;
        case 'NASDAQ':
          weightOptions = ['NASDAQ'];
          break;
        
      default:
        weightOptions = [];
    }

    // Mise à jour de l'option d'indexweight
    this.indexSelectionweight = weightOptions;

    // Vérifier si des options sont disponibles avant de sélectionner une valeur par défaut
    if (weightOptions.length > 0) {
        this.secondFormGroup.get('indexweight')?.setValue(weightOptions[0]);
    } else {
        this.secondFormGroup.get('indexweight')?.setValue(null); // Ou gérer une valeur par défaut
    }
}
  
onFileSelected(event: any): void {
  const file = event.target.files[0];

  if (file) {
    this.isLoadingPriceUpload = true;
    this.isFileUploaded = true;

    // Réinitialiser les validateurs
    this.firstFormGroup.get('indexSelection')?.clearValidators();
    this.firstFormGroup.get('indexSelection')?.updateValueAndValidity();
    this.secondFormGroup.get('indexweight')?.clearValidators();
    this.secondFormGroup.get('indexweight')?.updateValueAndValidity();
    this.addPortfolioItemForm.get('ticker')?.clearValidators();
    this.addPortfolioItemForm.get('weight')?.clearValidators();
    this.addPortfolioItemForm.get('ticker')?.updateValueAndValidity();
    this.addPortfolioItemForm.get('weight')?.updateValueAndValidity();

    this.removeAllRows();

    // Colonnes attendues
    const expectedHeaders = ['instrument_id', 'price', 'date'];

    // Parsing du fichier
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true, // Ignorer les lignes vides
      complete: (result) => {
        const parsedHeaders = result.meta.fields; // Obtenir les noms de colonnes
        if (!parsedHeaders) {
          alert('Fichier vide ou incorrect. Vérifiez le contenu.');
          this.isLoadingPriceUpload = false;
          return;
        }

        // Vérifier si toutes les colonnes attendues sont présentes
        const isValid = expectedHeaders.every(header => parsedHeaders.includes(header));
        if (!isValid) {
          alert(
            `The file does not match the expected columns. Expected columns : ${expectedHeaders.join(', ')}`
          );
          this.isLoadingPriceUpload = false;
          return;
        }

        // Si les colonnes sont valides, continuer avec le traitement
        this.dataSource = result.data.map((row: any) => ({
          instrument_id: row['instrument_id'],
          price: row['price'],
          date: row['date'],
        }));
        this.generateRandomColors();
        this.isLoadingPriceUpload = false;
      },
      error: (error) => {
        alert(`Erreur lors du parsing du fichier : ${error.message}`);
        this.isLoadingPriceUpload = false;
      },
    });
  }
}

  deleteFile(): void {
    this.isFileUploaded = false;
    this.isFileWeightUploaded =false;
    this.dataSource = [];
    this.dataSourceStep2=[]

    // Réinitialiser le champ input file pour qu'il soit vide
    this.fileInput.nativeElement.value = '';
    this.firstFormGroup.get('fileUpload')?.reset();
    this.fileweigh.nativeElement.value = '';
    this.secondFormGroup.get('fileUploadStep2')?.reset();
     // Réactiver les validations pour indexSelection
     this.firstFormGroup.get('indexSelection')?.setValidators(Validators.required);
     this.firstFormGroup.get('indexSelection')?.enable();
     this.firstFormGroup.get('indexSelection')?.updateValueAndValidity();
 
     // Réinitialiser les validations pour fileUpload
     this.firstFormGroup.get('fileUpload')?.setValidators(Validators.required);
     this.firstFormGroup.get('fileUpload')?.updateValueAndValidity();
     this.secondFormGroup.get('fileUploadStep2')?.setValidators(null); // Si vous voulez enlever les validations pour cette partie
    this.secondFormGroup.get('fileUploadStep2')?.updateValueAndValidity();
  }

  deleteFileWeights(): void {
    this.isButtonAddDisabled=true;
    this.isFileWeightUploaded = false;
    this.dataSourceStep2 = [];

    this.fileweigh.nativeElement.value = '';
    this.secondFormGroup.get('fileUploadStep2')?.reset();

    this.secondFormGroup.get('indexweight')?.setValidators(Validators.required);
    this.secondFormGroup.get('indexweight')?.enable();
    this.secondFormGroup.get('indexweight')?.updateValueAndValidity();

    // Réinitialiser les validations pour fileUploadStep2
    this.secondFormGroup.get('fileUploadStep2')?.setValidators(Validators.required);
    this.secondFormGroup.get('fileUploadStep2')?.enable();
    this.secondFormGroup.get('fileUploadStep2')?.updateValueAndValidity();
  }

  ngAfterViewInit(): void {
    // Vérifier si l'input file est bien désactivé après l'initialisation du composant
    this.updateFileInputState();
    this.updateFileWeightsInputState();
  }

  // Fonction qui met à jour l'état de l'input file
  updateFileInputState(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.disabled = this.isFileInputDisabled;
      console.log("Etat de l'input file mis à jour : ", this.isFileInputDisabled ? "Désactivé" : "Activé");
    }
  }
  updateFileWeightsInputState(): void {
    if (this.fileweigh) {
      this.fileweigh.nativeElement.disabled = this.isFileWeighDisabled;
      console.log("Etat de l'input file mis à jour : ", this.isFileWeighDisabled ? "Désactivé" : "Activé");
    }
  }

  onIndexChange(event: any): void {
    const selectedIndex = event.value;
    this.isIndexSelected = !!selectedIndex; // Si un index est sélectionné
    console.log("onIndexChange - isIndexSelected : ", this.isIndexSelected); // Log de débogage
    if (this.isIndexSelected) {
      this.isButtonAddDisabled=false;
      this.isFileInputDisabled = true; // Désactiver l'input file si un index est sélectionné
      this.isFileWeighDisabled = true;
      this.firstFormGroup.get('fileUpload')?.clearValidators();
      this.firstFormGroup.get('fileUpload')?.updateValueAndValidity();
      


    } else {
      this.isFileInputDisabled = false; // Réactiver l'input file si aucun index n'est sélectionné
      this.isFileWeighDisabled = false;

    }
    // Mettre à jour l'état de l'input file
    this.updateFileInputState();
    this.updateFileWeightsInputState();
    this.updateDateRangeBasedOnFileWeightUpload();

  }

  onFileSelectedForStep2(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.isLoadingWeightUpload=true;
      this.isFileWeightUploaded =true;
      this.isButtonAddDisabled=true;
      this.secondFormGroup.get('indexweight')?.clearValidators();
      this.secondFormGroup.get('indexweight')?.updateValueAndValidity();
      this.addPortfolioItemForm.get('ticker')?.clearValidators();
      this.addPortfolioItemForm.get('weight')?.clearValidators();
      this.addPortfolioItemForm.get('ticker')?.updateValueAndValidity();
      this.addPortfolioItemForm.get('weight')?.updateValueAndValidity();

      // Désactiver indexweight
      this.secondFormGroup.get('indexweight')?.disable();

      Papa.parse(file, {
        header: true,
        complete: (result) => {
          this.dataSourceStep2 = result.data.map((row: any) => ({
            instrument_id: row['instrument_id'],
            weight: row['weight'],
            date: row['date'],
          }));
          const dates = this.dataSourceStep2
          .filter(row => row.date) // Filtrer les lignes sans date
          .map(row => new Date(row.date)); // Convertir en objets Date

        if (dates.length > 0) {
          const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));


          const formattedMinDate = minDate.toISOString().split('T')[0];
          const formattedMaxDate = maxDate.toISOString().split('T')[0];

          this.minDate = formattedMinDate;
          this.maxDate = formattedMaxDate;
          this.updateDateRangeBasedOnFileWeightUpload();

         
        } else {
          console.error('Aucune date valide trouvée dans le fichier.');
        }
          this.isLoadingWeightUpload = false;

        },
        
      });


    }

  }

  generateRandomColors(): void {
    const uniqueIds = [...new Set(this.dataSource.map((item) => item.instrument_id))];
    uniqueIds.forEach((id) => {
      this.instrumentColors[id] = this.getRandomColor();
    });
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  onSubmitStep2() {
    console.log('Step 2 Form Submitted!', this.dataSourceStep2);
    
  }
  onSliderChange(event: any): void {
    this.transactionFeeValue = event.value;
  }

  onRangeChange(event: any): void {
    const newValue = event.target.value; // Gets value from range input
    this.selectedRangeValue = parseFloat((newValue / 100).toFixed(2)); // Convert to number
    this.thirdFormGroup.patchValue({
        transactionFee: this.selectedRangeValue // Update form control
    });
}
onBenchmarkWeightsFileSelected(event: any): void {
  const file = event.target.files[0];

  if (file) {
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        this.benchmarkWeightsData = result.data.map((row: any) => ({
          instrument_id: row['instrument_id'],
          weight: row['weight'],
        }));
      },
    });
  }
}
createBenchmark() { 
  throw new Error('Method not implemented.');
  } 
 

  addRow() { 
    if (this.addPortfolioItemForm.valid) {
      console.log('Avant l\'ajout du row, totalWeight:', this.totalWeight);

        const newTicker = this.addPortfolioItemForm.get('ticker')?.value;
        const newWeight = this.addPortfolioItemForm.get('weight')?.value;

        // Add the new row to the portfolio
        this.portfolio.push({ ticker: newTicker, weight: newWeight });

        // Add new form controls for the new row
        const portfolioLength = this.portfolio.length - 1; // Index of the newly added item
        this.portfolioForm.addControl(`ticker${portfolioLength}`, this._formBuilder.control(newTicker));
        this.portfolioForm.addControl(`weight${portfolioLength}`, this._formBuilder.control(newWeight, [
            Validators.required,
            Validators.min(-1),
            Validators.max(1)
        ]));

        // Listen for changes in the weight of the new asset
        this.portfolioForm.get(`weight${portfolioLength}`)?.valueChanges.subscribe(() => {
            this.calculeCash();
        });

        // Recalculate the total weight after adding the new row
        this.calculeCash();
        this.calculateTotalWeight();
        console.log('Après l\'ajout du row, totalWeight:', this.totalWeight);


        // Optionally, clear the form for new entries
        this.addPortfolioItemForm.reset();
        this.clean(this.addPortfolioItemForm.get('ticker'));
        this.secondFormGroup.get('fileUploadStep2')?.clearValidators();
        this.secondFormGroup.get('fileUploadStep2')?.updateValueAndValidity();
  
        // Désactiver l'input file
        this.secondFormGroup.get('fileUploadStep2')?.disable();
       // this.isButtonAddDisabled = this.addPortfolioItemForm.invalid || this.portfolio.length === 0;


       
    }
}

  

  // Enable edit mode for a specific row
  editRow(index: number) {
    this.isEditing[index] = true;
  }

  // Save the modified row
  saveRow(index: number) {
    if (this.portfolioForm.contains(`ticker${index}`) && this.portfolioForm.contains(`weight${index}`)) {
      this.portfolio[index].ticker = this.portfolioForm.get(`ticker${index}`)?.value;
      this.portfolio[index].weight = this.portfolioForm.get(`weight${index}`)?.value;
  
      // Exit edit mode
      this.isEditing[index] = false;
  
      // Optionally, you can reinitialize the controls to reflect the changes in the form (not strictly needed)
      this.initializePortfolioForm();
    } else {
      console.error(`Control for ticker${index} or weight${index} does not exist`);
    }
  }

  // Delete a row from the portfolio
  // Delete a row from the portfolio
// Delete a row from the portfolio
deleteRow(index: number) {
  if (index > -1 && index < this.portfolio.length) {
    // Afficher l'état avant la suppression
    console.log('Avant la suppression du row:', this.portfolio);
    console.log('Avant la suppression du totalWeight:', this.totalWeight);

    this.portfolio.splice(index, 1);

    this.portfolioForm.removeControl(`ticker${index}`);
    this.portfolioForm.removeControl(`weight${index}`);

    this.isEditing.splice(index, 1);

    for (let i = index; i < this.portfolio.length; i++) {
      const tickerControl = this.portfolioForm.get(`ticker${i + 1}`);
      const weightControl = this.portfolioForm.get(`weight${i + 1}`);

      if (tickerControl) tickerControl.setValue(this.portfolio[i].ticker);
      if (weightControl) weightControl.setValue(this.portfolio[i].weight);

      this.portfolioForm.removeControl(`ticker${i + 1}`);
      this.portfolioForm.removeControl(`weight${i + 1}`);

      this.portfolioForm.addControl(`ticker${i}`, this._formBuilder.control(this.portfolio[i].ticker, Validators.required));
      this.portfolioForm.addControl(`weight${i}`, this._formBuilder.control(this.portfolio[i].weight, [
        Validators.required,
        Validators.min(0),
        Validators.max(1)
      ]));
    }

    // Recalculer le poids total après suppression
    this.calculeCash();

    // Afficher le poids total après suppression
    console.log('Après la suppression du totalWeight:', this.totalWeight);
  }

  // Mettre à jour les instruments filtrés
  this.filteredDataToSearch = this.instrumentIds
    .filter(i => !this.portfolio.some(p => p.ticker === i.instrument_id))
    .map(w => w);
}


    
  getFormControl(controlName: string): FormControl {
    return this.portfolioForm.get(controlName) as FormControl;
  }

  initializeForm() {
    this.portfolio.forEach((asset, index) => {
      this.portfolioForm.addControl('ticker' + index, new FormControl(asset.ticker));
      this.portfolioForm.addControl('weight' + index, new FormControl(asset.weight));

      // Listen for changes in the weight controls and update total weight
      this.portfolioForm.get('weight' + index)?.valueChanges.subscribe(() => {
        this.calculeCash();
      });
    });
  }

  calculateTotalWeight() {
    // Calcule le poids total
    const totalWeight = this.portfolio.reduce((sum, asset, index) => {
        const weightControl = this.portfolioForm.get('weight' + index);
        const updatedWeight = weightControl ? weightControl.value : asset.weight;

        // Convertir le poids en nombre
        const weightValue = parseFloat(updatedWeight);
        if (isNaN(weightValue)) {
            return sum; // Ignorer les valeurs non numériques
        }

        return sum + weightValue;
    }, 0);

    // Arrondir la valeur et la stocker
    this.totalWeight = parseFloat(totalWeight.toFixed(2));
    console.log('Total Weight2:', this.totalWeight);

    // Calculer et mettre à jour la valeur du cash
    this.cashValuse = parseFloat((1 - totalWeight).toFixed(2)); 
}



calculeCash() {
  const totalWeight = this.portfolio.reduce((sum, asset, index) => {
    const weightControl = this.portfolioForm.get('weight' + index);
    console.log(weightControl)
    const updatedWeight = weightControl ? weightControl.value : asset.weight;

    console.log(`Poids de l'actif ${index}:`, updatedWeight);

    const weightValue = parseFloat(updatedWeight);
    if (isNaN(weightValue)) {
      return sum; 
    }

    return sum + weightValue;
  }, 0);

  this.cashValuse = parseFloat((1 - totalWeight).toFixed(2)); 
  this.totalWeight=totalWeight

  console.log('calculeCash - totalWeight après calcul:', totalWeight);
  console.log('cashValue après calcul:', this.cashValuse);
}



// This function will enforce both minimum and maximum limits
enforceLimits(index: number, event: any): void {
  const input = event.target;
  let value = parseFloat(input.value);
  const oldValue = input.getAttribute('data-old-value') || '';
  const newValue = input.value;
  // Enforce the max limit of 1 and min limit of -1
  if (value > 1) {
    value = 1;
    input.value = '1';  // Reset the input field to 1 if exceeded
  } else if (value < -1) {
    value = -1;
    input.value = '-1';  // Reset the input field to -1 if it's below minimum
  }
  else{
    if(this.cashValuse>1 || this.cashValuse<-1 ){
      value=oldValue;
      console.log('Old Value:', oldValue);

    }
    else{
      input.setAttribute('data-old-value', newValue);

    }

    
  }

  // Update the form control with the enforced value
  this.portfolioForm.get('weight' + index)?.setValue(value);

}


onStepChange(event: any) {
  // Vérifie si l'utilisateur est à la troisième étape (index 2)
  if (event.selectedIndex === 2) {
   // this.showCongratulations = true;
    this.showToastMessage('Congratulations insert Weights');

    //this.fireConfetti(); annimation auw step 3
    // Masquer le message après 5 secondes
   // setTimeout(() => {
     // this.showCongratulations = false;
      //this.cd.detectChanges(); // Utiliser ChangeDetectorRef pour forcer la détection des changements
    //}, 5000);
  }
}
showToastMessage(message: string) {
  this.snackBar.open(message, 'close', {
    duration: 3000, // Durée en millisecondes
    horizontalPosition: 'center',
    verticalPosition: 'top',
    panelClass: 'green-snackbar',
  });
}

fireConfetti() {
  confetti({
    particleCount: 100,   // Nombre de confettis
    spread: 70,           // Angle d'expansion
    origin: { y: 0.6 },   // Point de départ des confettis
  });
}

lookup(e:any) {
  this.filteredDataToSearch = this.instrumentIds
    .filter(
      i =>
        (i.instrument_id   
          .toLowerCase()
          .indexOf(e.target.value.toLowerCase()) > -1)&& (this.portfolio.filter(p => p.ticker === i.instrument_id).length === 0)
    )
    .map(w => {
      return  w;
      
    });
}

clean(t:any){
  t.value = '';
  this.filteredDataToSearch = this.instrumentIds
  .filter(
    i =>
      (this.portfolio.filter(p => p.ticker === i.instrument_id).length === 0)
  )
  .map(w => {
    return  w;
    
  });

}


calculateUploadId(): string {
  const timestamp = Date.now();  // Récupère le timestamp Unix en millisecondes
  const formattedDate = new Date().toLocaleDateString('fr-FR');  // Format de la date (ex : 18/12/2024)
  const uploadId = `upl-${formattedDate.replace(/\//g, '-')}-${timestamp}`;
  
  return uploadId;  // Retourne l'upload_id
}




onSubmit() {
  this.uploadId = this.calculateUploadId();

  
  this.isLoading = true;

  const parameterData = {
    user_id: this.userId,
    selected_index:this.firstFormGroup.value.indexSelection,
    start: this.startDate,
    end: this.endtDate,
    periodic_rebalancing: this.thirdFormGroup.value.periodicRebalancing,
    fractional_shares: this.thirdFormGroup.value.fractionalShares,
    capital: this.thirdFormGroup.value.initialCapital,
    monthly_cash_add: this.thirdFormGroup.value.monthlyCash,
    rebalance_frequency: this.thirdFormGroup.value.rebalancingFrequency,
    transaction_fee:this.thirdFormGroup.value.transactionFee,
    bm_strategy_equalWeight: this.fourthFormGroup.value.benchmarkStrategy.equalWeight,
    bm_strategy_TangencyPortfolio: this.fourthFormGroup.value.benchmarkStrategy.minimumVariance,
    upload_id:this.uploadId
  };

  this.supabaseService.insertData1('parameter', parameterData)
    .then(response => {
      if (response.success) {
        console.log('Data inserted successfully:', response.data);

        console.log(parameterData)
      } else {
        console.error('Error inserting data:', response.error);
        console.log(parameterData)

      }
    });
    setTimeout(() => {
      // Supposons que la sauvegarde est terminée
      this.isLoading = false;  // Arrête le chargement
      this.showToastMessage('Data Saved');
    }, 2000); // Ajustez la durée pour simuler le délai de sauvegarde
}

async saveData() {

  const date = this.thirdFormGroup.value.startDate;
  
  // Construire le tableau de données à insérer
  const dataToInsert = this.portfolio.map(item => ({
    date:  this.oldestDate,
    weight: item.weight,
    instrument_id: item.ticker,
    upload_id:this.uploadId,
    user_id: this.userId
  }));

  try {
    const result = await this.supabaseService.insertWeights(dataToInsert);
    console.log('weights  successfully inserted:', result);
    console.log(dataToInsert)

  } catch (error) {
    console.error('Error saving weights:', error);
    console.log(dataToInsert)

  }
}
uploadDataToDatabase(): void {

  this.isLoading = true;

  const dataToUpload = this.dataSource.map((row) => ({
    
    instrument_id: row['instrument_id'],
    price: row['price'],
    date:this.formatDate1(row.date),
    upload_id:this.uploadId,
      user_id: this.userId,

  }));


  this.supabaseService.saveUploadPrices(dataToUpload)
      .then(() => {
          this.dataSource = []; 
          this.deleteFile(); 
      })
      .catch((error) => {
          console.error('Erreur lors de l\'envoi des données :', error);
          this.showToastMessage('Erreur lors de l\'envoi des données.');
      });
      setTimeout(() => {
        // Supposons que la sauvegarde est terminée
        this.isLoading = false;  // Arrête le chargement
        this.showToastMessage('Data Saved');
      }, 2000); // Ajustez la durée pour simuler le délai de sauvegarde
}


uploadWeightsToDatabase(): void {


  const dataToUpload = this.dataSourceStep2.map((row) => ({
    
    instrument_id: row['instrument_id'],
            weight: row['weight'],
            date:this.formatDate1(row.date),
            upload_id:this.uploadId,
            user_id: this.userId,

  }));


  this.supabaseService.saveUploadWeights(dataToUpload)
      .then(() => {
          this.dataSource = []; 
          this.deleteFile(); 
      })
      .catch((error) => {
          console.error('Erreur lors de l\'envoi des données :', error);
          this.showToastMessage('Erreur lors de l\'envoi des données.');
      });
}








 formatDate1(date: string): string {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
      return '2024-12-01'; // Valeur par défaut si la date est invalide
  }
  return parsedDate.toISOString().split('T')[0]; // Formater en YYYY-MM-DD
}

submitData(){

  if (this.isFileUploaded) {
    this.onSubmit();
    this.uploadDataToDatabase();
this.uploadWeightsToDatabase();
  }
  else{
    this.onSubmit();
this.saveData();

  }
}

onCheckboxChange(event: Event, strategy: 'equalWeight' | 'minimumVariance'): void {
  const checkbox = event.target as HTMLInputElement;
  this.fourthFormGroup.get('benchmarkStrategy')?.patchValue({
    [strategy]: checkbox.checked
  });

  // Debugging
  console.log('Updated benchmarkStrategy:', this.fourthFormGroup.value.benchmarkStrategy);
}





isSelected(): boolean {
  return !!this.firstFormGroup.get('indexSelection')?.value;
}

// Fonction pour effacer la sélection
clearSelection() {
  if (this.fileInput) {
    this.fileInput.nativeElement.disabled = false;  // Retirer l'attribut disabled
    this.fileInput.nativeElement.value = '';  // Réinitialiser la valeur pour permettre une nouvelle sélection
    console.log('Input file réactivé et valeur réinitialisée');
  }
  if (this.fileweigh) {
    this.fileweigh.nativeElement.disabled = false;
    this.fileweigh.nativeElement.value = '';  // Réinitialiser la valeur pour permettre une nouvelle sélection

  }
  this.firstFormGroup.get('fileUpload')?.setValidators(Validators.required);
  this.firstFormGroup.get('fileUpload')?.updateValueAndValidity();

  // Réactiver les validations pour indexSelection
  this.firstFormGroup.get('indexSelection')?.setValidators(Validators.required);
  this.firstFormGroup.get('indexSelection')?.updateValueAndValidity();

  
  this.firstFormGroup.get('indexSelection')?.setValue(null);
this.removeAllRows()  

}

removeAllRows() {
  // Vider le tableau `portfolio`
  this.portfolio = [];

  // Supprimer tous les contrôles du formulaire `portfolioForm`
  Object.keys(this.portfolioForm.controls).forEach(controlName => {
      if (controlName.startsWith('ticker') || controlName.startsWith('weight')) {
          this.portfolioForm.removeControl(controlName);
      }
  });

  // Réinitialiser le total du poids (si pertinent dans votre cas)
  this.totalWeight = 0; // ou la méthode calculateTotalWeight() si cela met à jour automatiquement le total

  // Optionnellement, réinitialiser le formulaire d'ajout (si nécessaire)
  this.addPortfolioItemForm.reset();
  
  // Recalculer la liquidité après suppression
  this.calculeCash();
}



}