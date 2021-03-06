import { Router } from '@angular/router';
import { ActionSheetController, AlertController, ToastController, IonRouterOutlet } from '@ionic/angular';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ProductService } from './../../../shared/services/product.service';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Product } from 'src/app/shared/class/product';
import { Subscription } from 'rxjs';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImagePicker, ImagePickerOptions, OutputType } from '@ionic-native/image-picker/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AjaxResult } from 'src/app/shared/class/ajax-result';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
})
export class AddProductPage implements OnInit, OnDestroy {

  product: Product;
  subscription: Subscription
  constructor(private productService: ProductService,
              private categoryService: CategoryService,
              private actionSheetController: ActionSheetController,
              private alertController: AlertController,
              private zone: NgZone,
              private router: Router,
              private toastController: ToastController,
              private outlet: IonRouterOutlet,
              private barcodeScanner: BarcodeScanner,
              private camera: Camera,
              private imagePicker: ImagePicker) { 
    this.subscription = categoryService.watchCategory().subscribe( //use subscribe 
      (activeCategory) => {
        this.product.categoryName = activeCategory.name;
        this.product.categoryId = activeCategory.id;
      }, (error) => {
        console.log(error)
      });
    this.product = this.productService.initProduct();
    this.product.categoryName = "默认分类";
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * 拍照/相册操作表
   * @memberof AddProductPage
   */
  async onPresentActionSheet() {
    if (this.product.images.length === 3) {
      let toast: any;
      toast = await this.toastController.create({
        duration: 3000
      });
      toast.message = '最多只能三张图片';
      toast.present();
    } else {
      const actionSheet = await this.actionSheetController.create({
        header: '选择您的操作',
        cssClass: 'ascCss',
        buttons: [
          {
            text: '拍照',
            role: 'destructive',
            handler: () => {
              console.log('camera');
              this.onCamera();

            }
          }, {
            text: '相册',
            handler: () => {
              console.log('photos');
              this.onPicture();
            }
          }, {
            text: '取消',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      await actionSheet.present();
    }
  }

  /**
   * 新增供应商
   * @memberof AddProductPage
   */
  async presentAlertPrompt() {
    let toast: any;
      toast = await this.toastController.create({
        duration: 3000
      });
    const alert = await this.alertController.create({
      header: '新增供货商',
      cssClass: 'twoBtn',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: '输入供货商名称',
        },
        {
          name: 'phone',
          type: 'number',
          placeholder: '输入供货商电话',
        }
      ],
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: '保存',
          handler: (data) => {
            if (this.onPhoneValid(data.phone, data.name)) {
              this.product.supplier.name = data.name;
              this.product.supplier.phone = data.phone;
              this.toastUtil('保存成功');
            } else {
              this.toastUtil('保存失败，电话格式错误或信息为空');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * 验证电话号码是否有效，验证姓名电话是否填写
   * @param {number} phone
   * @param {string} name
   * @return {*}  {boolean}
   * @memberof AddProductPage
   */
  onPhoneValid(phone: number, name: string): boolean {
    const pat1 = /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,3,5-9]))\d{8}$/;
    const pat2 = /^(\d{4}-)?\d{6,8}$/;
    if (name.match(/^\s*$/)) {
      return false;
    }
    // console.log(pat1.test(phone.toString()));
    if (pat1.test(phone.toString()) || pat2.test(phone.toString())) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 扫描条形码
   * @memberof AddProductPage
   */
  onScan() {
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.product.barcode = barcodeData.text;
    }).catch(err => {
      console.log('Error', err);
    });
  }

  /**
   * 拍照
   * @memberof AddProductPage
   */
  onCamera() {
    const options: CameraOptions = {
      quality: 10,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      console.log(imageData);
      this.product.images.push(base64Image);
    }, (err) => {
      // Handle error
    });
  }

  /**
   * 访问相册
   * @memberof AddProductPage
   */
  onPicture() {
    const options: ImagePickerOptions = {
      maximumImagesCount: 3 - this.product.images.length,
      quality: 10,
      outputType: OutputType.DATA_URL
    };
    this.imagePicker.getPictures(options).then((results) => {
      for (var i = 0; i < results.length; i++) {
        this.product.images.push('data:image/jpeg;base64,' + results[i]);
      }
    }, (err) => { 
      console.log(err);
    });
  }

  /**
   * 保存商品信息
   * @param {boolean} [continues=false] false为直接保存，true为继续添加
   * @memberof AddProductPage
   */
  async onSave(continues: boolean = false){
    let toast: any;
    toast = await this.toastController.create({
      duration: 3000
    });
    if (this.product.importPrice == null) {
      this.product.importPrice = 0;
    }
    if (this.product.StorageNum == null) {
      this.product.StorageNum = 0;
    }
    this.productService.insert(this.product).then((result) => {
      console.log(result);
      if (result.success === true) {
        toast.message = '商品添加成功';
        toast.present();
        if (continues) {
          console.log('继续添加');
          this.product = this.productService.initProduct();
        }
        else {
          this.outlet.pop(1);
          this.router.navigateByUrl('/product-list');
        }
      } else {
        toast.message = result.error.message;
        toast.present();
      }
    });
  }

  async toastUtil(message: string) {
    let toast: any;
    toast = await this.toastController.create({
      duration: 3000,
      message: message
    });
    toast.present();
  }

}
