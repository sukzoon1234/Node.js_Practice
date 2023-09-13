# 2023.Project.MachineVision.Share
- 2023-2025 / 산자부 / 제조 결함 검출을 위한 AI 기반 고해상도 저전력 스마트 카메라 및 머신비전 통합 솔루션 개발
- 본 repository는 5종 제조 결함 검출 중 **문자 위치 검출 및 판독(OCR)** 모델의 학습 및 평가 코드입니다.
- 현재 버전 **(230915)** 의 모델은 학습이 총 2 stage로 진행되며,  
본 repository의 학습코드를 통해 **1, 2stage의 학습을 순서대로 진행**하실 수 있습니다.    
- 혹은 2 stage 까지 학습이 완료된 **pretrained ckpt를 불러와 평가만을 진행**하실 수도 있습니다.
   - **1st**: RoI 추출 모델 학습 (학습 완료된 **ckpt 제공**)
   - **2nd**: RoI, OCR 모델 결합 후 **RoI 모델은 freeze** 시키고 **OCR 모델 학습 진행**
- **새로운 Custom Dataset에 적용**하고자 하는 경우 1, 2의 학습을 모두 진행하는 것을 권장드립니다.

## Overview
- 아래 그림은 모델의 전체 pipeline을 나타내는 그림이며 크게 2단계로 동작합니다.
1. 원본 이미지를 1/4로 downsampling 후 저항 영역에 대한 **RoI** 추출
2. 추출한 RoI 영역에 대해 **Character Level OCR** 진행
<p align="center"><img src="fig/overview.png" width="900"></p>

## 실험 환경
* OS: Ubuntu 18.04
* CUDA: 11.6
* Python: 3.7.16
* Pytorch: 1.12.1
* Torchvision: 0.13.1
* GPU: NVIDIA GeForce RTX 3090

-----

# Install
- 학습 & 평가를 위한 **Docker Image** 와 **데이터셋** 그리고 **checkpoint** 파일입니다.

### Docker
- 해당 [docker hub 링크](https://hub.docker.com/r/sukzoon1234/sejong_rcv_1st_ocr)를 통해 **Docker Image 를 다운로드** 해 주세요.
- 혹은 아래 명령어로 바로 다운 가능합니다.
```
docker pull sukzoon1234/sejong_rcv_1st_ocr:1.0
```
### Datasets
- 본 모델의 학습, 평가에 사용된 **데이터셋** 입니다.
- 2차 배포 데이터셋의 **Achieved** 와 1차 배포 데이터셋의 **Generated** 를 함께 사용했습니다.
- 해당 [Google Drive 링크](https://drive.google.com/file/d/13OLJ4OkumWxqquXLzw_wsKwb_zva6GXX/view) 를 통해 다운로드 받으실 수 있습니다.

### Checkpoints
- 위 학습 데이터셋으로 미리 학습시킨 **pretrained checkpoint** 파일입니다.
   - fine-tuning 까지 완료 된 모델
   - RoI ckpt, OCR ckpt 모두 제공
- 해당 checkpoint를 다운 후 **Evaluation**에 사용하시면 됩니다.
- [Google Drive 링크](https://drive.google.com/drive/folders/10lp5wNytzX4vke4CrBuIDiDctYEjRFoX?usp=drive_link) 를 통해 다운로드 받으실 수 있습니다.

## Folder Setting
- 위 3가지 요소를 다운 후, 아래 폴더 구조에 맞게 구성해 주시면 됩니다.
- **폴더 구조**
```
├── checkpoint
    ├── OCR
        └── ...
    ├── ROI
        └── ...
├── datasets
    ├── achieved
        ├── ocr_achieved_led_230628_1.jpg
        ├── ocr_achieved_led_230628_1.json
        └── ...
    ├── generated
        ├── ocr_generated_led_230719_1.jpg
        ├── ocr_generated_led_230719_1.json
        └── ...
    ├── kaist_format_json
        ├── test_images.json
        ├── test_objects.json
        └── ...
    ├── txt
        └── ...
├── datasets_npu_OCR.py
├── datasets_npu_ROI.py
├── detect_npu_OCR.py
├── detect_npu_ROI.py
├── ...
└── ...
```
-----
# Training
- `model_mobilenetv2_roi_all_axiliary_8_13.py`: **RoI 추출 모델**
    - **Mobilenet_v2** backbone 기반 SSD 모델
- `model_mobilenetv2_ocr.py`: **OCR 수행 모델** 
    - **Mobilenet_v2** backbone 기반 SSD 모델

### Step 1. RoI 모델 학습하기
- RoI 추출 모델 학습 진행
```
CUDA_VISIBLE_DEVICES=0 OMP_NUM_THREADS=8 python train_ROI.py --epochs 440 \
                       --save_cycle 40 --ckpt_path mobilenet_v2
```
- 혹은 아래 bash 파일로도 실행 가능
```
bash scripts/train_roi.sh
```

### Step 2. OCR 모델 학습하기
- RoI 모델의 ckpt를 불러오기
- RoI 모델은 **freeze** 시켜놓고, OCR 모델 학습 진행
```
CUDA_VISIBLE_DEVICES=6 OMP_NUM_THREADS=8 python train_ROI_OCR.py --batch_size 8  --epochs 480 --start 0 --save_cycle 40 \
                       --roi_ckpt_epoch 440 --ckpt_ROI mobilenet_v2 --save_ckpt_OCR mobilenet_v2_6444_angle50 
```
- 혹은 아래 bash 파일로도 실행 가능
```
bash scripts/train.sh
```
# Evalution
- 학습 완료된 RoI/OCR ckpt를 불러와서 **Evaluation** 진행
- `light_model_mobilenetv2_roi_all_axiliary_8_13.py`: **RoI 추출 모델**
    - `model_mobilenetv2_roi_all_axiliary_8_13.py`에서 layer 7 이후 제거 버전
    -  backbone의 앞쪽 layer(4_3, 7)에서만 detect 하므로 성능차이 없음.
    -  test시 속도 향상을 위함
- `light_model_mobilenetv2_ocr.py`: **OCR 수행 모델** 
    - `model_mobilenetv2_ocr.py`에서 layer 7 이후 제거 버전
    -  backbone의 앞쪽 layer(4_3, 7)에서만 detect 하므로 성능차이 없음.
    -  test시 속도 향상을 위함
  
- `--save_image` 사용 시 **detection 시각화 결과**를 이미지로 저장
- `--save_json` 사용 시 예측 결과를 **원본 format의 json 파일**로 저장
- Evaluation 단계에서는 **batch size를 반드시 1로** 설정
```
CUDA_VISIBLE_DEVICES=7 OMP_NUM_THREADS=8 python detect_npu_OCR.py --batch_size 1 \
                       --roi_ckpt_epoch 440 --ckpt_ROI mobilenet_v2 --ocr_ckpt_epoch 400 --ckpt_OCR mobilenet_v2_6444_angle50  #--save_image --save_json
```
- 혹은 아래 bash 파일로도 실행 가능
```
bash scripts/test.sh
```
-----
## 결과
| Checkpoint | fps | mSec/img | mAP |
| :-----| :---- | :---- |  :---- | 
| [링크](https://drive.google.com/drive/folders/10lp5wNytzX4vke4CrBuIDiDctYEjRFoX?usp=drive_link) | 17.15 | 58.3 | 84.1 | 

<p align="left"><img src="fig/experiment_result.png" width="400"></p>

## Contact
- 질문이나 코멘트가 있으신 분들은 issue 혹은 아래의 이메일을 통해 연락해 주시길 바랍니다.
   - `sjkwon@rcv.sejong.ac.kr` 
