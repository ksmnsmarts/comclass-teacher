import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'src/app/0.shared/dialog/dialog.service';

@Component({
    selector: 'app-add-class',
    templateUrl: './add-class.component.html',
    styleUrls: ['./add-class.component.scss']
})
export class AddClassComponent implements OnInit {


    addClassForm: FormGroup;
    public fileData: File;

    constructor(
        private formBuilder: FormBuilder,
        private dialogService: DialogService,
    ) { 
        this.addClassForm = this.formBuilder.group({
            teacher: ['', [Validators.required]],
            subject: ['', [Validators.required]],
            upload_file: ['']
        });
    }

    ngOnInit(): void {


    }


    add() {
        const formData = new FormData();
        formData.append('teacher', this.addClassForm.value.teacher);
        formData.append('subject', this.addClassForm.value.subject);
    

        console.log(this.addClassForm.value)
    }


    cancel() {

    }


    onFileChange(fileData: any) {
        // 파일 유효성 검사
        // this.validateDocument(fileData)

        if (fileData.target.files.length > 0) {
            this.fileData = fileData.target.files[0];
            this.addClassForm.get('upload_file').setValue(this.fileData);
        }
    }

    // 파일 유효성 검사
    validateDocument(fileData: any) {

        if (fileData) {
            var ext = (fileData.target.files[0].name).substring((fileData.target.files[0].name).lastIndexOf('.') + 1);

            if (ext.toLowerCase() != 'pdf') {
                this.dialogService.openDialogNegative(`Please, upload the '.pdf' file.`);
                // this.addClassForm.upload_file.reset()
            }
        }
    }

}
