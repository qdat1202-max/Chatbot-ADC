import { EquipmentModel } from '../types';

export interface OfficialErrorCode {
  code: string;
  equipmentModel: EquipmentModel;
  name: string;
  meaning: string;
  category: 'Cơ khí & Kim hút' | 'Quang học & Cảm biến' | 'Hóa chất & Buồng đếm' | 'Điện tử & Nhiệt độ' | 'Phần mềm & Kết nối';
  typicalSymptom: string;
  standardResolution: string;
}

export const OFFICIAL_ERROR_CODES: Record<EquipmentModel, OfficialErrorCode[]> = {
  'Zybio EXC200/220': [
    {
      code: 'E101',
      equipmentModel: 'Zybio EXC200/220',
      name: 'Lỗi kim hút mẫu / hóa chất (Probe Collision / Miss Step)',
      meaning: 'Kim hút mẫu/hóa chất bị kẹt cơ khí, lệch tọa độ trục Z hoặc va chạm vào thành cốc mẫu / lọ hóa chất.',
      category: 'Cơ khí & Kim hút',
      typicalSymptom: 'Cánh tay kim hút dừng đột ngột, phát âm thanh trượt bước mô-tơ, phần mềm báo lỗi E101.',
      standardResolution: 'Căn chỉnh lực căng curoa trục Z, vệ sinh puly và chạy căn chỉnh tọa độ kim hút (Mechanical Alignment).'
    },
    {
      code: 'E102',
      equipmentModel: 'Zybio EXC200/220',
      name: 'Lỗi cánh tay kim khuấy phản ứng (Mixer Bar Error)',
      meaning: 'Kim khuấy phản ứng không quay hoặc không hạ được vào cuvette do trượt curoa hoặc hỏng cảm biến định vị.',
      category: 'Cơ khí & Kim hút',
      typicalSymptom: 'Kim khuấy không dao động trộn dung dịch, cuvette không được hòa tan đều.',
      standardResolution: 'Kiểm tra mô tơ xoay kim khuấy, vệ sinh trục nâng hạ và hiệu chuẩn độ sâu khuấy.'
    },
    {
      code: 'E103',
      equipmentModel: 'Zybio EXC200/220',
      name: 'Lỗi đĩa quay cuvette phản ứng (Reaction Carousel Error)',
      meaning: 'Đĩa cuvette không xoay đúng vị trí đo quang hoặc cảm biến home đĩa phản ứng bị che khuất.',
      category: 'Cơ khí & Kim hút',
      typicalSymptom: 'Đĩa phản ứng dừng sai góc quay, kim hút hoặc trạm rửa không hạ được xuống cuvette.',
      standardResolution: 'Vệ sinh mắt quang sensor vị trí Home đĩa ủ, tra dầu ray trượt đĩa phản ứng.'
    },
    {
      code: 'E104',
      equipmentModel: 'Zybio EXC200/220',
      name: 'Dao động nhiệt độ buồng ủ phản ứng (Incubator Temp Abnormal)',
      meaning: 'Nhiệt độ buồng ủ sinh hóa dao động ngoài khoảng tiêu chuẩn 37.0°C ± 0.2°C do cảm biến PT100 hoặc bo gia nhiệt.',
      category: 'Điện tử & Nhiệt độ',
      typicalSymptom: 'Màn hình cảnh báo nhiệt độ ủ 35.8°C hoặc 38.5°C, kết quả enzyme ALT/AST bị lệch.',
      standardResolution: 'Vệ sinh giắc tiếp xúc cảm biến PT100, đo trở kháng 109.7Ω tại 25°C, thay bo điều khiển nhiệt nếu cần.'
    },
    {
      code: 'E105',
      equipmentModel: 'Zybio EXC200/220',
      name: 'Lỗi đĩa chứa mẫu / hóa chất (Sample/Reagent Carousel Error)',
      meaning: 'Đĩa hóa chất hoặc đĩa bệnh phẩm bị kẹt vị trí, đầu đọc mã vạch không quét được mã lọ hóa chất.',
      category: 'Cơ khí & Kim hút',
      typicalSymptom: 'Đĩa hóa chất không xoay khi chuyển xét nghiệm, báo không tìm thấy hóa chất.',
      standardResolution: 'Kiểm tra chốt định vị đĩa, vệ sinh mắt đọc quang và căn chỉnh bước xoay mô tơ bước.'
    },
    {
      code: 'E201',
      equipmentModel: 'Zybio EXC200/220',
      name: 'Lỗi cảm biến phát hiện mực chất lỏng (Liquid Level Detection)',
      meaning: 'Kim hút mẫu/hóa chất không phát hiện được bề mặt chất lỏng (LLD Failure) hoặc báo giả mức dịch.',
      category: 'Quang học & Cảm biến',
      typicalSymptom: 'Kim cắm ngập quá sâu hoặc kim không chạm dịch đã dừng lại, thể tích hút bị thiếu.',
      standardResolution: 'Vệ sinh kim hút sạch tủa muối, kiểm tra tiếp địa vỏ máy và độ nhạy bo mạch cảm biến điện dung.'
    },
    {
      code: 'E205',
      equipmentModel: 'Zybio EXC200/220',
      name: 'Lỗi trạm rửa Cuvette / Tràn nước thải (Cuvette Wash & Drain Overflow)',
      meaning: 'Trạm rửa 8 kim không hút cạn nước thải, trào dịch rửa ra buồng đo do tắc ống silicone kết tủa photphat.',
      category: 'Hóa chất & Buồng đếm',
      typicalSymptom: 'Nước thải dâng cao trong cuvette, tràn ra đĩa phản ứng, giá trị Cuvette Blank bị đục OD > 0.05.',
      standardResolution: 'Thông 8 kim hút rửa bằng dây 0.15mm, ngâm ngập dung dịch ADC-Cleanser 30 phút, thay ống silicone Ø3x5.'
    },
    {
      code: 'E310',
      equipmentModel: 'Zybio EXC200/220',
      name: 'Năng lượng đèn đo quang Halogen suy giảm (Photometer Lamp Low Energy)',
      meaning: 'Bóng đèn Halogen 12V/20W hết tuổi thọ (>2000 giờ), năng lượng bước sóng 340nm tụt dưới 30.000 counts.',
      category: 'Quang học & Cảm biến',
      typicalSymptom: 'Kết quả xét nghiệm âm hoặc không đo được ở bước sóng cực tím 340nm (ALT, AST, CK, LDH).',
      standardResolution: 'Thay bóng đèn Halogen 12V/20W chính hãng (Part: EXC-LMP-01), vệ sinh kính tụ quang và chạy Gain Calibration.'
    },
    {
      code: 'E401',
      equipmentModel: 'Zybio EXC200/220',
      name: 'Lỗi giao tiếp bo mạch chủ (Main Board Communication Failure)',
      meaning: 'Mất tín hiệu kết nối RS232 / CAN-Bus giữa máy tính điều khiển và bo mạch vi xử lý trung tâm.',
      category: 'Phần mềm & Kết nối',
      typicalSymptom: 'Phần mềm báo mất kết nối phần cứng (Hardware Offline), nút Start bị mờ.',
      standardResolution: 'Cắm lại cáp truyền thông DB9/USB, kiểm tra nguồn cấp 24V/5V DC trên bo mạch chính.'
    }
  ],

  'Zybio Z3 CRP': [
    {
      code: 'H101',
      equipmentModel: 'Zybio Z3 CRP',
      name: 'Nghẽn vi lỗ buồng đếm bạch cầu (WBC Aperture Clog)',
      meaning: 'Lỗ vi thông buồng đếm WBC 80µm bị nghẽn do sợi fibrin máu đông hoặc tiểu cầu vón cục.',
      category: 'Hóa chất & Buồng đếm',
      typicalSymptom: 'Thời gian đếm kéo dài, kết quả WBC hiển thị *** hoặc dao động không kiểm soát.',
      standardResolution: 'Chạy chu trình Clean Aperture Zap xung điện và ngâm Probe Cleanser 15 phút, soi kính lúp thông ngược.'
    },
    {
      code: 'H102',
      equipmentModel: 'Zybio Z3 CRP',
      name: 'Nghẽn vi lỗ buồng đếm hồng cầu (RBC Aperture Clog)',
      meaning: 'Lỗ vi thông buồng đếm RBC/PLT 50µm bị nghẽn, áp suất hút buồng đếm bị tăng cao.',
      category: 'Hóa chất & Buồng đếm',
      typicalSymptom: 'Kết quả RBC, HCT, PLT hiển thị dấu sao hoặc báo Clog trên đồ thị histogram.',
      standardResolution: 'Ngâm dung dịch tẩy rửa ADC Enzymatic Cleanser, chạy chu trình rửa áp lực ngược Backflush.'
    },
    {
      code: 'H103',
      equipmentModel: 'Zybio Z3 CRP',
      name: 'Bọt khí hoặc nhiễu điện buồng đếm (Aperture Bubble / Noise Interference)',
      meaning: 'Có bọt khí lọt vào buồng đếm hoặc tiếp địa máy kém gây nhiễu xung điện trở kháng.',
      category: 'Quang học & Cảm biến',
      typicalSymptom: 'Biểu đồ WBC bị nhô cao ở gốc tọa độ, số đếm nền Background WBC/PLT cao bất thường.',
      standardResolution: 'Kiểm tra độ kín gioăng buồng đếm, tiếp địa máy đạt điện trở đất < 4Ω, đuổi bọt khí đường ống Diluent.'
    },
    {
      code: 'H108',
      equipmentModel: 'Zybio Z3 CRP',
      name: 'Nghẽn van pinch kẹp ống pha loãng (Pinch Valve Clog / Jammed)',
      meaning: 'Đoạn ống silicone qua van pinch kẹp hóa chất Diluent/Lyse bị bẹp dính mất độ đàn hồi sau thời gian dài.',
      category: 'Hóa chất & Buồng đếm',
      typicalSymptom: 'Máy không hút được dung dịch pha loãng, chu trình Prime hóa chất báo lỗi áp suất hút.',
      standardResolution: 'Thay mới 2 đoạn ống cao su silicone y tế đàn hồi cao chuyên dụng Z3, chạy Prime đuổi bọt khí.'
    },
    {
      code: 'H201',
      equipmentModel: 'Zybio Z3 CRP',
      name: 'Cạn hóa chất pha loãng (Diluent Empty / Depleted)',
      meaning: 'Cảm biến phao báo cạn bình Diluent kích hoạt hoặc đường hút hóa chất bị hở khí.',
      category: 'Hóa chất & Buồng đếm',
      typicalSymptom: 'Đèn báo hóa chất nhấp nháy đỏ, máy khóa lệnh hút mẫu xét nghiệm.',
      standardResolution: 'Thay can hóa chất Diluent chính hãng mới, kiểm tra phao đo mức và chạy lệnh Reagent Prime.'
    },
    {
      code: 'H202',
      equipmentModel: 'Zybio Z3 CRP',
      name: 'Phát hiện cục máu đông (Blood Clot Detected)',
      meaning: 'Mẫu máu toàn phần có vi huyết khối làm tắc đường hút kim hút mẫu trước khi vào buồng đếm.',
      category: 'Hóa chất & Buồng đếm',
      typicalSymptom: 'Màn hình hiện cảnh báo đỏ CLOT DETECTED, máy tự ngắt lệnh hút mẫu.',
      standardResolution: 'Dùng dây thông nòng 0.1mm thông kim hút, ngâm Probe Cleanser và chạy mẫu máu đã ly tâm kiểm tra.'
    },
    {
      code: 'H203',
      equipmentModel: 'Zybio Z3 CRP',
      name: 'Cạn dung dịch phá hồng cầu (Lyse Empty / Depleted)',
      meaning: 'Can Lyse hết hoặc bơm cấp Lyse không hút được dung dịch vào buồng ủ phản ứng.',
      category: 'Hóa chất & Buồng đếm',
      typicalSymptom: 'Hồng cầu không bị phá vỡ, kết quả HGB và WBC sai lệch nghiêm trọng.',
      standardResolution: 'Thay can dung dịch Lyse mới, kiểm tra bơm vi lượng Syringe Lyse và chạy Prime Lyse.'
    },
    {
      code: 'H301',
      equipmentModel: 'Zybio Z3 CRP',
      name: 'Lỗi cụm đo quang học CRP (CRP Optical Module Error)',
      meaning: 'Đi-ốt phát quang LED hoặc cảm biến quang đo độ đục miễn dịch CRP bị bẩn thấu kính hoặc mất tín hiệu.',
      category: 'Quang học & Cảm biến',
      typicalSymptom: 'Kết quả định lượng CRP không hiển thị hoặc báo OD vượt ngưỡng tuyến tính.',
      standardResolution: 'Vệ sinh mặt kính cuvette đo quang CRP bằng cồn chuyên dụng, hiệu chuẩn lại giá trị điện thế Gain CRP.'
    },
    {
      code: 'H305',
      equipmentModel: 'Zybio Z3 CRP',
      name: 'Dao động nhiệt độ buồng ủ phản ứng CRP (CRP Chamber Temp Abnormal)',
      meaning: 'Bản nhiệt Peltier làm ấm buồng phản ứng CRP bị oxy hóa keo tản nhiệt hoặc quạt khoang đáy hỏng.',
      category: 'Điện tử & Nhiệt độ',
      typicalSymptom: 'Cảnh báo nhiệt độ buồng ủ CRP ngoài dải 37.0°C ± 0.3°C, kết quả CRP chênh lệch.',
      standardResolution: 'Bôi lớp keo tản nhiệt gốm Thermal Grease mới lên module Peltier, thay quạt làm mát khoang đáy 12V DC.'
    },
    {
      code: 'H408',
      equipmentModel: 'Zybio Z3 CRP',
      name: 'Áp suất hút mẫu bất thường / Nghẽn đường hút (Aspiration Pressure Abnormal)',
      meaning: 'Cảm biến áp lực phát hiện lực cản dòng chảy cao khi kim hút mẫu đang hút bệnh phẩm.',
      category: 'Cơ khí & Kim hút',
      typicalSymptom: 'Hút mẫu không đủ thể tích 10µL, báo lỗi H408 trên màn hình LCD.',
      standardResolution: 'Vệ sinh kim hút, kiểm tra độ kín van phân phối mẫu và súc rửa đường ống hút.'
    }
  ],

  'Zybio Z50': [
    {
      code: 'Z501',
      equipmentModel: 'Zybio Z50',
      name: 'Cảnh báo cụm Laser quang học (Laser Optical Scatter Error)',
      meaning: 'Năng lượng diode phát Laser suy giảm hoặc thấu kính hội tụ bị bụi làm suy hao chùm tia tán xạ góc 10° và 90°.',
      category: 'Quang học & Cảm biến',
      typicalSymptom: 'Đồ thị phân tán 5 thành phần bạch cầu (Scattergram) bị mờ, không tách biệt được bạch cầu ái toan/hạt.',
      standardResolution: 'Vệ sinh mặt kính thấu kính Laser Flow Cell bằng giấy lau quang học và Isopropanol 99.9%, căn chỉnh Optical Gain.'
    },
    {
      code: 'Z502',
      equipmentModel: 'Zybio Z50',
      name: 'Nghẽn kim hút mẫu 5 thành phần (5-Part Sample Probe Clog)',
      meaning: 'Lòng kim hút mẫu đường kính trong vi lượng bị sợi huyết khối hoặc tinh thể muối làm tắc nghẽn.',
      category: 'Cơ khí & Kim hút',
      typicalSymptom: 'Lượng hút không đủ chu trình phân tích Laser, áp suất âm hút mẫu không đạt.',
      standardResolution: 'Dùng dây thông nòng titan thông kim, ngâm dung dịch tẩy rửa protein enzyme trong 20 phút.'
    },
    {
      code: 'Z503',
      equipmentModel: 'Zybio Z50',
      name: 'Lỗi cơ cấu quang học buồng dòng chảy (Flow Cell Mechanism Error)',
      meaning: 'Dòng bao quanh Sheath Flow bị xoáy hoặc bọt khí làm lệch đường đi của tế bào qua tiêu điểm Laser.',
      category: 'Quang học & Cảm biến',
      typicalSymptom: 'Đồ thị scattergram bị co cụm tại tâm, tỷ lệ tế bào nhận diện giảm.',
      standardResolution: 'Xả bọt khí buồng Flow Cell bằng chu trình Bubble Purge, kiểm tra áp suất dòng bao.'
    },
    {
      code: 'Z504',
      equipmentModel: 'Zybio Z50',
      name: 'Nhiệt độ buồng lyse quang học vượt ngưỡng (WBC Lyse Incubator Temp Error)',
      meaning: 'Cảm biến nhiệt NTC 10k hoặc mạch gia nhiệt buồng ủ lyse quang học bị chập gián đoạn, nhiệt độ ngoài dải 35°C - 39°C.',
      category: 'Điện tử & Nhiệt độ',
      typicalSymptom: 'Báo lỗi nhiệt độ buồng ủ đỏ màn hình, không cho phép đo chuỗi 5 thành phần.',
      standardResolution: 'Đo điện trở nguội NTC 10k, thay thế cảm biến nhiệt NTC chính hãng Zybio (Part: Z50-NTC-02).'
    },
    {
      code: 'Z505',
      equipmentModel: 'Zybio Z50',
      name: 'Lỗi áp suất dương bơm khí nén (Positive Pressure Error)',
      meaning: 'Bơm nén khí không tạo đủ áp lực dương (+60 kPa) để đẩy mẫu và hóa chất qua buồng phản ứng.',
      category: 'Hóa chất & Buồng đếm',
      typicalSymptom: 'Thời gian trộn mẫu kéo dài, van khí xả phát tiếng kêu xì xào liên tục.',
      standardResolution: 'Kiểm tra màng bơm khí nén, siết chặt các khớp nối cút khí và thay lọc khí đầu vào.'
    },
    {
      code: 'Z506',
      equipmentModel: 'Zybio Z50',
      name: 'Lỗi van phân phối hóa chất nhuộm DIFF (DIFF Staining Valve Error)',
      meaning: 'Van điện từ nạp dung dịch nhuộm phân tích cụm tế bào bạch cầu bị kẹt do cặn hóa chất.',
      category: 'Hóa chất & Buồng đếm',
      typicalSymptom: 'Không phân biệt được tế bào Mono và Eosinophil trên biểu đồ 3D.',
      standardResolution: 'Súc rửa cuộn solenoid van điện từ, thay màng cao su van phân phối hóa chất.'
    },
    {
      code: 'Z507',
      equipmentModel: 'Zybio Z50',
      name: 'Cạn dung dịch đệm bao dòng (Sheath Fluid Depleted)',
      meaning: 'Thùng dung dịch Sheath Fluid cạn hoặc cảm biến phao mức chất lỏng bị kẹt.',
      category: 'Hóa chất & Buồng đếm',
      typicalSymptom: 'Máy báo hết dung dịch bao dòng, dừng chu trình đo tế bào Laser.',
      standardResolution: 'Bổ sung thùng Sheath Fluid mới, kiểm tra ống hút dung dịch và nạp đầy buồng phụ.'
    },
    {
      code: 'Z508',
      equipmentModel: 'Zybio Z50',
      name: 'Lỗi áp suất bơm chân không không đạt ngưỡng (Vacuum Pump Pressure Error)',
      meaning: 'Áp lực âm xả thải buồng đo chỉ đạt -32kPa (tiêu chuẩn yêu cầu -42kPa đến -45kPa) do rạn nứt ống silicone 4x6mm.',
      category: 'Hóa chất & Buồng đếm',
      typicalSymptom: 'Thời gian xả thải buồng đo kéo dài quá định mức 4.2 giây, nước thải rút chậm.',
      standardResolution: 'Thay đoạn ống silicone chịu áp lực âm 4x6mm nối van chân không số 3, súc rửa màng van điện từ Solenoid.'
    }
  ],

  'FS-205': [
    {
      code: 'FS101',
      equipmentModel: 'FS-205',
      name: 'Kẹt khay nạp thẻ test cassette (Test Cassette Feeder Tray Jam)',
      meaning: 'Khay trượt nạp thẻ test huỳnh quang bị kẹt cơ khí do bụi hóa chất hoặc bánh răng truyền động bị trượt.',
      category: 'Cơ khí & Kim hút',
      typicalSymptom: 'Khay cassette không thụt vào hoặc không nhả thẻ ra sau khi đo, máy báo âm thanh bíp liên tục.',
      standardResolution: 'Vệ sinh rãnh trượt bằng cồn, tra mỡ Teflon vào vit-me và làm sạch cảm biến quang hành trình chữ U.'
    },
    {
      code: 'FS102',
      equipmentModel: 'FS-205',
      name: 'Lỗi đầu đọc huỳnh quang quang học (Fluorescence Optical Readhead Error)',
      meaning: 'Cụm thấu kính quang học quét vạch huỳnh quang bị bám bụi hoặc LED kích thích bước sóng 365nm bị mờ.',
      category: 'Quang học & Cảm biến',
      typicalSymptom: 'Giá trị vạch chứng C (Control Line) quá thấp, máy báo Invalid Test Strip.',
      standardResolution: 'Vệ sinh thấu kính đầu đọc bằng tăm bông quang học, chạy chu trình chuẩn hóa quang học với thẻ QC chuẩn.'
    },
    {
      code: 'FS103',
      equipmentModel: 'FS-205',
      name: 'Lỗi cảm biến phát hiện thẻ test strip (Test Strip Insertion Sensor Error)',
      meaning: 'Mắt quang phát hiện khay đã có thẻ cassette bị hỏng hoặc bị che khuất bởi dị vật.',
      category: 'Quang học & Cảm biến',
      typicalSymptom: 'Đã đưa thẻ vào khay nhưng máy không tự động kéo vào, màn hình báo No Strip.',
      standardResolution: 'Làm sạch mắt cảm biến hồng ngoại tại khe cửa nạp thẻ, kiểm tra cáp dẹt tín hiệu.'
    },
    {
      code: 'FS201',
      equipmentModel: 'FS-205',
      name: 'Lỗi máy in nhiệt tích hợp (Thermal Printer Paper/Head Error)',
      meaning: 'Máy in hết giấy in nhiệt, kẹt trục cuốn giấy hoặc đầu in nhiệt bị quá nhiệt.',
      category: 'Điện tử & Nhiệt độ',
      typicalSymptom: 'Kết quả đo xong nhưng không in được phiếu kết quả, đèn máy in nháy cam.',
      standardResolution: 'Lắp lại cuộn giấy in nhiệt khổ 57mm đúng mặt cảm nhiệt, lau sạch thanh gạt đầu in nhiệt.'
    },
    {
      code: 'FS202',
      equipmentModel: 'FS-205',
      name: 'Lỗi động cơ đẩy thẻ test (Cassette Pusher Motor Error)',
      meaning: 'Mô-tơ bước điều khiển trục đẩy thẻ test bị kẹt hoặc đứt dây tín hiệu encoder.',
      category: 'Cơ khí & Kim hút',
      typicalSymptom: 'Khay nạp phát tiếng kêu tạch tạch cơ khí, thẻ test bị dừng giữa chừng.',
      standardResolution: 'Kiểm tra khớp nối động cơ đẩy, căn chỉnh thanh trượt định vị và kiểm tra điện áp cấp mô tơ.'
    }
  ]
};

export function getOfficialCodesForModel(model: EquipmentModel): OfficialErrorCode[] {
  return OFFICIAL_ERROR_CODES[model] || [];
}

export function getAllOfficialCodes(): OfficialErrorCode[] {
  return [
    ...OFFICIAL_ERROR_CODES['Zybio EXC200/220'],
    ...OFFICIAL_ERROR_CODES['Zybio Z3 CRP'],
    ...OFFICIAL_ERROR_CODES['Zybio Z50'],
    ...OFFICIAL_ERROR_CODES['FS-205']
  ];
}

export function getOfficialCodeDetails(code: string, model?: EquipmentModel): OfficialErrorCode | undefined {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) return undefined;

  if (model && OFFICIAL_ERROR_CODES[model]) {
    const found = OFFICIAL_ERROR_CODES[model].find(c => c.code.toUpperCase() === cleanCode);
    if (found) return found;
  }

  const all = getAllOfficialCodes();
  return all.find(c => c.code.toUpperCase() === cleanCode);
}

export function isValidOfficialCode(code: string, model?: EquipmentModel): boolean {
  return Boolean(getOfficialCodeDetails(code, model));
}
