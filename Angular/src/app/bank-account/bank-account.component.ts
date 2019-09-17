import { BankAccountService } from './../shared/bank-account.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, Validators, FormGroup } from '@angular/forms';
import { BankService } from '../shared/bank.service';

@Component({
  selector: 'app-bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.css']
})
export class BankAccountComponent implements OnInit {

  bankAccountForms: FormArray = this.fb.array([]);
  bankList = [];
  notification = null;

  constructor(private fb: FormBuilder,
    private bankService: BankService,
    private service: BankAccountService) { }

  ngOnInit() {
    this.bankService.getBankList()
      .subscribe(res => this.bankList = res as []);

    this.service.getBankAccountList().subscribe(
      res => {
        if (res == [])
          this.addBankAccountForm();
        else {
          //generate formarray as per the data received from BankAccont table
          (res as []).forEach((bankAccount: any) => {
            this.bankAccountForms.push(this.fb.group({
              bankAccountID: [bankAccount.bankAccountID],
              accountNumber: [bankAccount.accountNumber, Validators.required],
              accountHolder: [bankAccount.accountHolder, Validators.required],
              bankID: [bankAccount.bankID, Validators.min(1)],
              IFSC: [bankAccount.ifsc, Validators.required]
            }));
          });
        }
      }
    );
  }

  addBankAccountForm() {
    this.bankAccountForms.push(this.fb.group({
      bankAccountID: [0],
      accountNumber: ['', Validators.required],
      accountHolder: ['', Validators.required],
      bankID: [0, Validators.min(1)],
      IFSC: ['', Validators.required]
    }));
  }

  recordSubmit(fg: FormGroup) {
    if (fg.value.bankAccountID == 0)
      this.service.postBankAccount(fg.value).subscribe(
        (res: any) => {
          fg.patchValue({ bankAccountID: res.bankAccountID });
          this.showNotification('insert');
        });
    else
      this.service.putBankAccount(fg.value).subscribe(
        (res: any) => {
          this.showNotification('update');
        });
  }

  onDelete(bankAccountID, i) {
    if (bankAccountID == 0)
      this.bankAccountForms.removeAt(i);
    else if (confirm('Are you sure to delete this record ?'))
      this.service.deleteBankAccount(bankAccountID).subscribe(
        res => {
          this.bankAccountForms.removeAt(i);
          this.showNotification('delete');
        });
  }

  showNotification(category) {
    switch (category) {
      case 'insert':
        this.notification = { class: 'text-success', message: 'saved!' };
        break;
      case 'update':
        this.notification = { class: 'text-primary', message: 'updated!' };
        break;
      case 'delete':
        this.notification = { class: 'text-danger', message: 'deleted!' };
        break;

      default:
        break;
    }
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

}
