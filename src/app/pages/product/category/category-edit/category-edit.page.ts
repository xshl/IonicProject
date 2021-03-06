import { CategoryService } from 'src/app/shared/services/category.service';
import { Category } from './../../../../shared/class/category';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CategoryNameEditPage } from '../category-name-edit/category-name-edit.page';
import { IonItemSliding, ModalController, AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.page.html',
  styleUrls: ['./category-edit.page.scss'],
})
export class CategoryEditPage implements OnInit {

  category: Category;
  constructor(private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
    private toastController: ToastController) {
    activatedRoute.queryParams.subscribe(queryParams => {
      this.category = categoryService.getCategory(queryParams.id);
    });
  }

  ngOnInit() {
  }

  private async presentModal(name: string, id: number, childId: number) {
    const modal = await this.modalController.create({
      component: CategoryNameEditPage,
      componentProps: { value: name, id: id, childId: childId }
    });
    await modal.present();
    return modal.onWillDismiss();
  }

  async onEditCategoryName(item: IonItemSliding) {
    item.close();
    const { data } = await this.presentModal(this.category.name, this.category.id, 0);
    console.log(data);
    if (data) {
      this.category.name = data;
    }
  }

  async onEditSubCategoryName(item: IonItemSliding, subCategory: Category) {
    item.close();
    const { data } = await this.presentModal(subCategory.name, this.category.id, subCategory.id);
    if (data) {
      subCategory.name = data;
    }
  }

  async onDelete(item: IonItemSliding, subId?: number) {
    const toast = await this.toastController.create({
      duration: 3000,
      message: '删除成功'
    });
    // 其他代码省略
    const alert = await this.alertController.create({
      header: '你确认要删除吗!',
      cssClass: 'twoBtn',
      message: '请先删除该类别下的所有商品记录',
      buttons: [
        {
          text: '取消',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: '确认',
          handler: () => {
            console.log('Confirm Okay');
            // 其他代码省略
            if (subId == null) {
              item.close();
              if (this.categoryService.deleteCategory(this.category.id)) {
                toast.message = "删除成功";
                this.router.navigate(['/product/category/list'],{
                  queryParams: {
                    id: 0
                  }
                })
              } else {
                toast.message = "默认分类不可删除";
              }
            } else {
              item.close();
              this.categoryService.delteteChild(this.category, subId);
              this.category = this.categoryService.getCategory(this.category.id);
            }
            toast.present();
          }
        }
      ]
    });
    await alert.present();
  }

}
