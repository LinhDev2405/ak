dòng 17 mini bug => if(!empty($single_page) && !empty($post_ID)){
45 break; // Stop after first match to avoid duplicate titles

        if($single_page !== $single_num_page){
          wpse_get_partial('components/common-parts/purchase-list',['post_ID'=>$post->ID,'single_page'=>$single_page]);
        }

-----
Báo Cáo Lỗi: Duplicate Title trên trang Single Purchase Item
🔍 Nguyên nhân
Sau khi phân tích code, chúng tôi xác định được 3 nguyên nhân gây ra lỗi title bị trùng lặp:

1. Thiếu điều kiện dừng trong vòng lặp CSV (func_setup_query_arg.php)

Khi tìm kiếm thông tin title từ file CSV, vòng lặp không dừng lại sau khi tìm thấy kết quả đầu tiên. Điều này dẫn đến việc nếu có nhiều dòng trong CSV khớp với điều kiện tìm kiếm (ví dụ: URL kết thúc giống nhau như brand/rolex/day-date), title sẽ bị ghi đè nhiều lần và có thể lấy sai giá trị từ dòng cuối cùng thay vì dòng đầu tiên phù hợp.

2. Lỗi cú pháp PHP trong điều kiện kiểm tra (func_setup_query_arg.php dòng 18)

Biểu thức $single_page && !empty($post_ID) trả về boolean, sau đó !empty(true) luôn là true. Điều này có thể gây ra behavior không mong muốn trong một số edge case.

3. Component purchase-list được gọi 2 lần với cùng path (single-purchase_item.php)

Trên trang single purchase item, component purchase-list được gọi 2 lần:

Lần 1: Tìm theo số hiệu sản phẩm (型番)
Lần 2: Tìm theo priority (model → brand → gem → gold → cat)
Khi cả 2 lần tìm kiếm đều trả về cùng một path (ví dụ: sản phẩm Day-Date có 型番 khớp với trang brand/rolex/day-date, đồng thời model cũng khớp với trang đó), cùng một title sẽ được render 2 lần trên giao diện.

✅ Cách khắc phục
#	Vấn đề	Khắc phục
1	Vòng lặp không dừng sau match	Thêm break; sau khi tìm thấy row đầu tiên khớp trong CSV
2	Bug cú pháp !empty()	Sửa thành !empty($single_page) && !empty($post_ID)
3	Gọi purchase-list 2 lần trùng	Thêm điều kiện if($single_page !== $single_num_page) trước khi gọi lần 2
📁 Files đã sửa
func_setup_query_arg.php - Dòng 18, 47
single-purchase_item.php - Dòng 563-566
🧪 Kiểm tra
Sau khi áp dụng bản sửa, vui lòng kiểm tra các trang sau để xác nhận title không còn bị duplicate:

Trang Day-Date: /purchase_item/[slug-day-date]
Các trang có 型番 khớp với model name
