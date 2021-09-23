var API_KEY = "1234";

const { json } = require('body-parser');
const e = require('express');
const { query } = require('express');
var express = require('express')
var router = express.Router();

const { poolPromise, sql } = require('../db.js')// nhan tu cai file db.js //dung


/*
 *test 
 */

router.get('/', function (req, res) {
    res.end("api running");
});

router.get('/testapi', function (req, res) {
    res.end("xin chao moi nguoi minh la xuan tri");
});

router.get('/testapiselect', async (req, res)=> {
    console.log(req.query);
   
        try {
            const pool = await poolPromise // cai poolPromise nay no se nhan du lieu ket noi tu db.js
            const queryResult = await pool.request()
                .query('SELECT IdUser,PhoneUser,NameUser,AddressUser,TrangThai FROM [Userr] ')
            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }))
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }))
            }
        }
        catch (err) {
            res.status(500)
            res.send(JSON.stringify({ success: false, message: err.message }));
        }





});


//========
//post image ban goc
//===============
const multer = require('multer');
fs = require('fs-extra')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
})
var upload = multer({ storage: storage })

// Upload Single File
router.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        console.log("error", 'Please upload a file');

        res.send({ code: 500, msg: 'Please upload a file' })
        return next({ code: 500, msg: error })

    }
    res.send({ code: 200, message: file.filename })
   // res.send(JSON.stringify({ success: true, message:file.filename}));

})



//===========================================
//user table 
// post/get / get user for admin
//=========================================================

//get user
router.get('/user', async (req, res, next) => {
    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var idUser = req.query.idUser;//req.query.fbid co nghia la lay cai fbid cua cai link
        if (idUser != null) {
            try {
                const pool = await poolPromise // cai poolPromise nay no se nhan du lieu ket noi tu db.js
                const queryResult = await pool.request()
                    .input('IdUser', sql.NVarChar, idUser)
                    .query('SELECT IdUser,PhoneUser,NameUser,AddressUser,TrangThai FROM [Userr] where IdUser=@IdUser')
                if (queryResult.recordset.length>0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }))
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "Empty" }))
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }

        else {
            res.send(JSON.stringify({ success: false, message: "missing fbid in query" }));
        }
    }
});

//get user for admin
router.get('/userforadmin', async (req, res, next) => {
    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
            try {
                const pool = await poolPromise // cai poolPromise nay no se nhan du lieu ket noi tu db.js
                const queryResult = await pool.request()
                    .query('SELECT IdUser,PhoneUser,NameUser,AddressUser,TrangThai FROM [Userr] ')
                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }))
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "Empty" }))
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

       
    }
});

//search user
router.get('/searchUser', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var UserPhone = req.query.UserPhone;
        if (UserPhone != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('UserPhone', sql.NVarChar, '%' + UserPhone + '%')
                    .query('select   IdUser,PhoneUser,NameUser,AddressUser,TrangThai from [Userr] where PhoneUser like @UserPhone')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: false, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing foodName in query" }));
        }


    }
});


//post user 
router.post('/user', async (req, res, next) => {
    console.log(req.body);
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {
        var user_phone = req.body.userPhone;
        var user_name = req.body.userName;
        var user_address = req.body.userAddress;
        var idUser = req.body.idUser;

        if (idUser != null) {
            try {
                
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('UserPhone', sql.NVarChar, user_phone)
                    .input('UserName', sql.NVarChar, user_name)
                    .input('UserAddress', sql.NVarChar, user_address)
                    .input('IdUser', sql.NVarChar, idUser)
                    .query('IF EXISTS (SELECT * FROM [Userr] WHERE IdUser=@IdUser) UPDATE [Userr] set NameUser=@UserName,AddressUser=@UserAddress WHERE IdUser=@IdUser'
                    + ' ELSE INSERT INTO[Userr](IdUser,PhoneUser, NameUser, AddressUser,TrangThai) OUTPUT Inserted.IdUser, Inserted.PhoneUser, Inserted.NameUser, Inserted.AddressUser,Inserted.TrangThai VALUES(@IdUser, @UserPhone, @UserName, @UserAddress,0)'


                    );

                console.log(queryResult);
                if (queryResult.rowsAffected!=null) {
                    res.send(JSON.stringify({ success: true, message: "success" }))
                }
                else {
                    res.send(JSON.stringify({success:false,message:"inser or login false"}))
                }
                    

            }
                     catch (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }));
                }

              
            
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing fbid in body of post request" }));
        }
    }
});

//update status user

router.post('/updateStatusUser', async (req, res, next) => {
    console.log(req.body);
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {
        var idUser = req.body.idUser;
        var TrangThai = req.body.TrangThai;
        if (idUser != null) {
            try {

                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('TrangThai', sql.Int, TrangThai)
                    .input('IdUser', sql.NVarChar, idUser)
                    .query('update [Userr] set TrangThai=@TrangThai where IdUser=@IdUser'
                    );

                console.log(queryResult);
                if (queryResult.rowsAffected != null) {
                    res.send(JSON.stringify({ success: true, message: "success" }))
                }
                else {
                    res.send(JSON.TrangThai({ success: false, message: "update fail" }))
                }


            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }



        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing fbid in body of post request" }));
        }
    }
});



//===========================================
//adminn table 
// post/get 
//=========================================================

//post admin 
router.post('/admin', async (req, res, next) => {
    console.log(req.body);
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {
        var AdminPhone = req.body.AdminPhone;
        var AdminName = req.body.AdminName;
        var IdAdmin = req.body.IdAdmin;

        if (IdAdmin != null) {
            try {

                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('AdminPhone', sql.NVarChar, AdminPhone)
                    .input('AdminName', sql.NVarChar, AdminName)
                    .input('IdAdmin', sql.NVarChar, IdAdmin)
                    .query('IF EXISTS (SELECT * FROM [adminn] WHERE IdAdmin=@IdAdmin) UPDATE'
                    +'  [adminn] set PhoneAdmin =@AdminPhone, NameAdmin =@AdminName WHERE IdAdmin =@IdAdmin'
                        + ' ELSE INSERT INTO[adminn](IdAdmin,PhoneAdmin, NameAdmin) '
                        + 'OUTPUT Inserted.IdAdmin, Inserted.PhoneAdmin, Inserted.NameAdmin '
                    +'VALUES(@IdAdmin, @AdminPhone, @AdminName)'
                        

                    );

                console.log(queryResult);
                if (queryResult.rowsAffected != null) {
                    res.send(JSON.stringify({ success: true, message: "success" }))
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "inser or login false" }))
                }


            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }



        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing fbid in body of post request" }));
        }
    }
});


// get admin
router.get('/admin', async (req, res, next) => {
    console.log(req.query);
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var IdAdmin = req.query.IdAdmin;//req.query.fbid co nghia la lay cai fbid cua cai link
        if (IdAdmin != null) {
            try {
                const pool = await poolPromise // cai poolPromise nay no se nhan du lieu ket noi tu db.js
                const queryResult = await pool.request()
                    .input('IdAdmin', sql.NVarChar, IdAdmin)
                    .query('SELECT IdAdmin,PhoneAdmin,NameAdmin FROM [adminn] where IdAdmin=@IdAdmin')
                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }))
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "Empty" }))
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }

        else {
            res.send(JSON.stringify({ success: false, message: "missing fbid in query" }));
        }
    }
});



//===========================================
// SanPham  table
// post/get , deldete search
//=========================================================

router.get('/sanPham', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        try {
            var IdUser = req.query.IdUser;
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('IdUser', sql.NVarChar, IdUser)
                .query('SELECT IdUser,IdSP,TenSP,GiaSP,MoTa,IdDanhMuc,hinh from [SanPham] where IdUser not in (@IdUser)'
                    +' order by IdSP DESC')// sau nay chinh lai cai khong trung id

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            } else {
                res.send(JSON.stringify({ success: true, message: "empty" }));
            }
        }
        catch (err) {
            res.status(500)
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
});

router.get('/sanPhamById', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var idSP = req.query.idSP;
        if (idSP != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('idSP', sql.Int, idSP)
                    .query('SELECT IdUser,IdSP,TenSP,GiaSP,MoTa,IdDanhMuc,hinh from [SanPham] WHERE idSP=@idSP')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: false, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: false, message: "empty" }));
                }

            } catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing ID in query" }));
        }
    }

});

// get san pham buy id user
router.get('/sanPhamByIdUser', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var IdUser = req.query.IdUser;
        if (IdUser != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('IdUser', sql.NVarChar, IdUser)
                    .query('SELECT IdUser,IdSP,TenSP,GiaSP,'
                        +' MoTa, IdDanhMuc, hinh ,trangthai from[SanPham] WHERE IdUser =@IdUser')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success:true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: false, message: "empty" }));
                }

            } catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing ID in query" }));
        }
    }

});

// get san pham buy id danh muc
router.get('/sanPhamByIdDanhMuc', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var IdDanhMuc = req.query.IdDanhMuc;
        if (IdDanhMuc != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('IdDanhMuc', sql.Int, IdDanhMuc)
                    .query('SELECT IdUser,IdSP,TenSP,GiaSP,'
                    + ' MoTa, IdDanhMuc, hinh ,trangthai from[SanPham] WHERE IdDanhMuc =@IdDanhMuc')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: false, message: "empty" }));
                }

            } catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing ID in query" }));
        }
    }

});

//upload sanpham
router.post('/sanpham', async (req, res, next) => {
    console.log(req.body);
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {
        var IdUser = req.body.IdUser;
        var TenSP = req.body.TenSP;
        var GiaSP= req.body.GiaSP;
        var Mota  = req.body.Mota;
        var IdDanhMuc = req.body.IdDanhMuc;
        var hinh = req.body.hinh;

        if (IdUser != null) {
            try {

                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('TenSP', sql.NVarChar, TenSP)
                    .input('GiaSP', sql.Float, GiaSP)
                    .input('Mota', sql.NVarChar, Mota)
                    .input('IdUser', sql.NVarChar, IdUser)
                    .input('IdDanhMuc', sql.Int, IdDanhMuc)
                    .input('hinh', sql.NVarChar, hinh)
                    .query('INSERT INTO[SanPham](TenSP,GiaSP, Mota, IdUser,IdDanhMuc,hinh,trangthai)'
                    +' VALUES(@TenSP,@GiaSP, @Mota, @IdUser,@IdDanhMuc,@hinh,-1)'
                    );

                console.log(queryResult);
                if (queryResult.rowsAffected != null) {
                    res.send(JSON.stringify({ success: true, message: "success" }))
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "inser or login false" }))
                }


            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }



        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing fbid in body of post request" }));
        }
    }
});

//upload san pham
router.post('/updatesanpham', async (req, res, next) => {
    console.log(req.body);
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {
        var TenSP = req.body.TenSP;
        var GiaSP = req.body.GiaSP;
        var Mota = req.body.Mota;
        var IdDanhMuc = req.body.IdDanhMuc;
        var hinh = req.body.hinh;
        var IdSP = req.body.IdSP;
        if (IdSP != null) {
            try {

                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('TenSP', sql.NVarChar, TenSP)
                    .input('GiaSP', sql.Float, GiaSP)
                    .input('Mota', sql.NVarChar, Mota)
                    .input('IdSP', sql.Int, IdSP)
                    .input('IdDanhMuc', sql.Int, IdDanhMuc)
                    .input('hinh', sql.NVarChar, hinh)
                    .query('UPDATE [SanPham] set TenSP=@TenSP,GiaSP=@GiaSP, Mota=@Mota,IdDanhMuc=@IdDanhMuc,hinh=@hinh,trangthai=-1 where IdSP=@IdSP');

                console.log(queryResult);
                if (queryResult.rowsAffected != null) {
                    res.send(JSON.stringify({ success: true, message: "success" }))
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "inser or login false" }))
                }


            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }



        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing IdSP in body of post request" }));
        }
    }
});

//delete sanpham
router.delete('/sanpham', async (req, res, next) => {
    console.log(req.query);
    if (req.query.key != API_KEY) {// body la dung cho lenh post , query dung cho lenh get
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {

        var IdSP = req.query.IdSP;

        if (IdSP != null) {

            try {

                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('IdSP', sql.Int, IdSP)
                    .query('delete   [SanPham] where   IdSP=@IdSP');

                res.send(JSON.stringify({ success: true, message: "success" }));
                console.log("success");

            } catch (err) {
                console.log(err)
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }))
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "missing IdUser , IdSP in body of post request" }));
        }

    }


});

//search san pham
router.get('/searchSanPham', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var search_query = req.query.NameSanPham;
        if (search_query != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('SearchQuery', sql.NVarChar, '%' + search_query + '%')
                    .query('select  IdUser,IdSP,TenSP,GiaSP,'
                    +' MoTa, IdDanhMuc, hinh ,trangthai  from [SanPham] where TenSP like @SearchQuery')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: false, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing foodName in query" }));
        }


    }
});

//===========================================
//danh muc  table
//get 
//=========================================================

router.get('/danhmuc', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .query('select IdDanhMuc,TenDM   from [DanhMuc]');

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

     


    }
});

//===========================================
//gio hang table
// post/get /delete
//=========================================================

//get gio hang
router.get('/giohang', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var IdUser = req.query.IdUser;
        if (IdUser != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('IdUser', sql.NVarChar, IdUser)
                    .query('select  [GioHang].IdUser,[GioHang].IdSP,[GioHang].TenSP,Gia,hinh,[GioHang].IdSeller  from [GioHang],[SanPham] where [GioHang].IdUser=@IdUser and [GioHang].IdSP = [SanPham].IdSP');

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }

        else {
            res.send(JSON.stringify({ success: false, message:"missing id in query"}));
        }


    }
});

//delete gio hang
router.delete('/giohang', async (req, res, next) => {
    console.log(req.query);
    if (req.query.key != API_KEY) {// body la dung cho lenh post , query dung cho lenh get
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {

        var IdUser = req.query.IdUser;
        var IdSP = req.query.IdSP;

        if (IdUser != null&&IdSP!=null) {

            try {

                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('IdUser', sql.NVarChar, IdUser)
                    .input('IdSP', sql.Int, IdSP)
                    .query('delete  from [GioHang] where IdUser=@IdUser and IdSP=@IdSP');

                res.send(JSON.stringify({ success: true, message: "success" }));
                console.log("success");

            } catch (err) {
                console.log(err)
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }))
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "missing IdUser , IdSP in body of post request" }));
        }

    }


});


//post gio hang 
router.post('/giohang', async (req, res, next) => {
    console.log(req.body);
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {
        var TenSP = req.body.TenSP;
        var IdSP = req.body.IdSP;
        var IdUser = req.body.IdUser;
        var Gia = req.body.Gia;
        var IdSeller = req.body.IdSeller;

        if (IdUser != null && IdSP!=null ) {
            try {

                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('IdSP', sql.Int, IdSP)
                    .input('Gia', sql.Float, Gia)
                    .input('TenSP', sql.NVarChar, TenSP)
                    .input('IdUser', sql.NVarChar, IdUser)
                    .input('IdSeller', sql.NVarChar, IdSeller)
                    .query('IF EXISTS (SELECT * FROM [GioHang] WHERE IdUser=@IdUser and IdSP=@IdSP) UPDATE [GioHang]'
                    + ' set TenSP =@TenSP, Gia =@Gia WHERE IdUser =@IdUser and IdSP=@IdSP '
                        + ' ELSE INSERT INTO[GioHang](IdUser,IdSP, TenSP, Gia,IdSeller) '
                    +'OUTPUT Inserted.IdUser, Inserted.IdSP, Inserted.TenSP, Inserted.Gia, Inserted.IdSeller VALUES(@IdUser, @IdSP, @TenSP, @Gia, @IdSeller)'
                    );

                console.log(queryResult);
                if (queryResult.rowsAffected != null) {
                    res.send(JSON.stringify({ success: true, message: "success" }))
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "inser or login false" }))
                }


            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }



        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing fbid in body of post request" }));
        }
    }
});

//===========================================
//don hang table
// post/get 
//=========================================================

//create don hang
router.post('/donhang', async (req, res, next) => {
    console.log(req.body);
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {
        var TenUser = req.body.TenUser;
        var DiaChi = req.body.DiaChi;
        var NgayDat = req.body.NgayDat;
        var gia = req.body.gia;
        var IdUser = req.body.IdUser;
        var TrangThai = req.body.TrangThai;
        var sdt = req.body.sdt;
        var IdSP = req.body.IdSP;
        var IdSeller = req.body.IdSeller;

        if (IdUser != null ) {
            try {

                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('TenUser', sql.NVarChar, TenUser)
                    .input('DiaChi', sql.NVarChar, DiaChi)
                    .input('NgayDat', sql.Date, NgayDat)
                    .input('gia', sql.Float, gia)
                    .input('IdUser', sql.NVarChar, IdUser)
                    .input('TrangThai', sql.Int, TrangThai)
                    .input('sdt', sql.NVarChar, sdt)
                    .input('IdSP', sql.Int, IdSP)
                    .input('IdSeller', sql.NVarChar, IdSeller)
                    .query('insert into [DonHang]'
                    + '(TenUser,DiaChi,NgayDat,gia,IdUser,TrangThai,sdt,IdSP,IdSeller)'
                        + 'values'
                    + '(@TenUser,@DiaChi,@NgayDat,@gia,@IdUser,@TrangThai,@sdt,@IdSP,@IdSeller)'
                    );
                console.log(queryResult);
                    res.send(JSON.stringify({ success: true, message: "success" }))
                    

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }



        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing iduser" }));
        }
    }
});

//get don hang by buyer 
router.get('/donhangByBuyer', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var IdUser = req.query.IdUser;
        if (IdUser != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('IdUser', sql.NVarChar, IdUser)
                    .query('select IdDonHang,TenUser,DiaChi,NgayDat,[DonHang].IdUser,[DonHang].TrangThai,sdt,gia,[DonHang].IdSP,IdSeller,[SanPham].TenSP,[SanPham].hinh'
                    +' from[DonHang],[SanPham]   where [DonHang].IdUser =@IdUser and [SanPham].IdSP=[DonHang].IdSP order by IdDonHang DESC');

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing menuId in query" }));
        }

    }
});

//get don hang by seller 
router.get('/donhangBySeller', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var IdUser = req.query.IdUser;
        if (IdUser != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('IdUser', sql.NVarChar, IdUser)
                    .query('select IdDonHang, TenUser, DiaChi, NgayDat, [DonHang].IdUser,[DonHang].TrangThai, sdt, gia, [DonHang].IdSP, IdSeller, [SanPham].TenSP,[SanPham].hinh'
                    + ' from[DonHang],[SanPham] where [DonHang].IdSeller =@IdUser and [SanPham].IdSP=[DonHang].IdSP order by IdDonHang DESC');

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing menuId in query" }));
        }

    }
});

//update trang thai  don hang
router.post('/updatestatusdonhang', async (req, res, next) => {
    console.log(req.body);
    if (req.body.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {
        var TrangThai = req.body.TrangThai;
        var IdDonHang = req.body.IdDonHang;

        if (IdDonHang != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('TrangThai', sql.Int, TrangThai)
                    .input('IdDonHang', sql.Int, IdDonHang)
                    .query('UPDATE [DonHang] set TrangThai=@TrangThai WHERE IdDonHang=@IdDonHang' );

                console.log(queryResult);
                if (queryResult.rowsAffected != null) {
                    res.send(JSON.stringify({ success: true, message: "success" }))
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "fail upadate" }))
                }
                //cai mnany sao kho cap nhap xong xe get lai gia tri

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }



        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing fbid in body of post request" }));
        }
    }
});


//get food by menu
router.get('/food', async (req, res, next) => { 
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var menu_id = req.query.menuId;
        if (menu_id != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('MenuId', sql.Int, menu_id)
                    .query('select id,name,description,image,price,isSize,isAddon,discount from [Food] where id in (select foodId from [Menu_Food] where menuId =@MenuId )')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing menuId in query" }));
        }


    }
});

//get food by id
router.get('/foodById', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var food_id = req.query.foodId;
        if (food_id != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FoodId', sql.Int, food_id)
                    .query('select id,name,description,image,price,isSize,isAddon,discount from [Food] where id =@FoodId')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing foodId in query" }));
        }


    }
});

//search food
router.get('/searchFood', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var search_query = req.query.foodName;
        if (search_query != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('SearchQuery', sql.NVarChar,'%'+ search_query+'%')
                    .query('select id,name,description,image,price,isSize,isAddon,discount from [Food] where name like @SearchQuery')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing foodName in query" }));
        }


    }
});

//===========================================
//size table
// post/get 
//=========================================================

//get size by food id
router.get('/size', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var food_id = req.query.foodId;
        if (food_id != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FoodId', sql.Int, food_id)
                    .query('select id,description,extraPrice from [Size] where id in (select sizeId from [Food_Size] where foodId =@FoodId )')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing FoodId in query" }));
        }


    }
});

//===========================================
//addon table
// post/get 
//=========================================================

//get size by food id
router.get('/addon', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var food_id = req.query.foodId;
        if (food_id != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FoodId', sql.Int, food_id)
                    .query('select id,description,extraPrice from [Addon] where id in (select AddonId from [Food_AddOn] where foodId =@FoodId )')

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing FoodId in query" }));
        }


    }
});

//===========================================
//order and oeder detail table
// post/get 
//=========================================================

//get order
router.get('/order', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var order_fbid = req.query.orderFBID;
        if (order_fbid != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('OrderFBID', sql.NVarChar, order_fbid)
                    .query('select orderId,orderFBID,orderName,orderAddress,orderStatus,'
                        + 'orderDate,restaurantId,transactionId,cod,totalPrice,numOfItem'
                        + ' FROM [Order] where orderFBID=@OrderFBID');

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing orderFBID in query" }));
        }


    }
});

//get order detal

router.get('/orderDetail', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var order_id = req.query.orderId;
        if (order_id != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('OrderId', sql.Int, order_id)
                    .query('select orderId,itemId,quantity,discount,extraPrice,size,addon from [OrderDetail] where orderId=@OrderId');

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing Order Id in query" }));
        }


    }
});

//create order
router.post('/createOrder', async (req, res, next) => { 
    console.log(req.body);
    if (req.body.key != API_KEY) {// body la dung cho lenh post , query dung cho lenh get
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {
        
        var order_phone = req.body.orderPhone;
        var order_name = req.body.orderName;
        var order_address = req.body.orderAddress;
        var order_date = req.body.orderDate;
        var restaurant_id = req.body.retaurantId;
        var transaction_id = req.body.transactionId;
        var cod = req.body.cod;
        var total_price = req.body.totalPrice;
        var num_of_item = req.body.num_of_item;
        var order_fbid = req.body.orderFBID;

        if (order_fbid != null) {
            try {

                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('OrderFBID', sql.NVarChar,order_fbid )
                    .input('OrderPhone', sql.NVarChar, order_phone)
                    .input('OrderName',sql.NVarChar,order_name)
                    .input('OrderAddress', sql.NVarChar,order_address )
                    .input('OrderDate', sql.Date,order_date )
                    .input('RestaurantId', sql.Int, restaurant_id )
                    .input('TransactionId', sql.NVarChar,transaction_id )
                    .input('COD', sql.Bit, cod == true ? 1 : 0)
                    .input('TotalPrice', sql.Float,total_price )
                    .input('NumOfItem', sql.Int, num_of_item )
                    .query('insert into [Order]'
                    + '(OrderFBID,OrderPhone,OrderName,OrderAddress,OrderDate,OrderStatus,RestaurantId,TransactionId,COD,TotalPrice,NumOfItem)'
                        + 'values'
                    + '(@OrderFBID,@OrderPhone,@OrderName,@OrderAddress,@OrderDate,1,@RestaurantId,@TransactionId,@COD,@TotalPrice,@NumOfItem)'
                        + 'select top 1 OrderId as orderNumber from [Order] where OrderFBID=@OrderFBID order by orderNumber DESC' );

                console.log(queryResult);
                if (queryResult.recordset.length != null) { //rowAffected : so hang anh huong , dung cho lenh insert , cap nhap  /recordset: lay cac truy van trong select
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }))
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "Empty" }));
                }

            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }



        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing orderFBID in body of post request" }));
        }
    }
});

//update order
router.post('/updateOrder', async (req, res, next) => {
    console.log(req.body);
    if (req.body.key != API_KEY) {// body la dung cho lenh post , query dung cho lenh get
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {

        var order_id = req.body.orderId
        var order_detail

        try {
            order_detail = JSON.parse(req.body.orderDetail);
        } catch (err) {
            console.log(err)
            res.status(500)
            res.stringify(JSON.stringify({ success: false, message: err.message }))


        }


        if (order_detail != null && order_id != null) {

            try {

                const pool = await poolPromise
                const table = new sql.Table('OrderDetail');//create virtual table to bulk insert // tao bang ao de chen hoan looat
                table.create = true

                table.columns.add('OrderId', sql.Int, { nullable: false, primary: true })
                table.columns.add('ItemId', sql.Int, { nullable: false, poolPromise: true })
                table.columns.add('Quantity', sql.Int, { nullable: true, poolPromise: true })
                table.columns.add('Price', sql.Float, { nullable: true })
                table.columns.add('Discount', sql.Int, { nullable: true })
                table.columns.add('Size', sql.NVarChar(40), { nullable: true })
                table.columns.add('Addon', sql.NVarChar(4000), { nullable: true })
                table.columns.add('ExtraPrice', sql.Float, { nullable: true })

                for (i = 0; i < order_detail.length; i++) {
                    table.rows.add(
                        order_id,
                        order_detail[i]["foodId"],
                        order_detail[i]["foodQuantity"],
                        order_detail[i]["foodPrice"],
                        order_detail[i]["foodDiscount"],
                        order_detail[i]["foodSize"],
                        order_detail[i]["foodAddon"],
                        parseFloat( order_detail[i]["foodExtraPrice"]),

                    )
                }

                const request = pool.request()
                request.bulk(table, (err, resultBulk) => {
                    if (err) {
                        console.log(err)
                        res.send(JSON.stringify({ success: false, message: err }))
                    } else {
                        res.send(JSON.stringify({success:false,message:err}))
                    }
                })

            } catch (err) {
                console.log(err)
                res.status(500)
                res.send(JSON.stringify({success:false,message:err.message}))
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "missing order_id or order detail in body of post request" }));
        }

    }

        

    
});

//===========================================
//favorite table 
// post/get /delete 
//=========================================================


//get favorite by idfb
router.get('/favorite', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {
        var fbid = req.query.fbid;
        if (fbid != null) {

            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FBID', sql.NVarChar, fbid)
                    .query('select fbid,foodId,foodName,foodImage,restaurantId,restaurantName,price'
                        +' from [Favorite] where fbid=@FBID');

                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
                } else {
                    res.send(JSON.stringify({ success: true, message: "empty" }));
                }
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing FBID in query" }));
        }


    }
});


//get favorite by idfb and restaurantId
router.get('/favoriteByRestaurant', async (req, res, next) => {
    console.log(req.query)
    if (req.query.key != API_KEY) {
        res.send(JSON.stringify({ success: false, message: "wrong api key" }));
    }
    else {

        var fbid = req.query.fbid;
        var restaurant_id = req.query.restaurantId;
        if (fbid != null) {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('FBID', sql.NVarChar, fbid)
                .input('RestaurantId', sql.Int, restaurant_id)
                .query('select fbid,foodId,foodName,foodImage,restaurantId,restaurantName,price'
                    + ' from [Favorite] where fbid=@FBID and restaurantId=@RestaurantId');

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            } else {
                res.send(JSON.stringify({ success: true, message: "empty" }));
            }
            try {
              
            }
            catch (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        }
        else {
            res.send(JSON.stringify({ success: false, message: "missing FBID or restaurantId in query" }));
        }


    }
});

//create favorite
router.post('/favorite', async (req, res, next) => {
    console.log(req.body);
    if (req.body.key != API_KEY) {// body la dung cho lenh post , query dung cho lenh get
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {

        var fbid = req.body.fbid;
        var food_id = req.body.foodId;
        var restaurant_id = req.body.restaurantId;
        var restaurant_name = req.body.restaurantName;
        var food_name = req.body.foodName;
        var food_image = req.body.foodImagel;
        var food_price = req.body.foodPrice;



     

        if (fbid!=null) {

            try {

                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FBID', sql.NVarChar, fbid)
                    .input('FoodId', sql.Int, food_id)
                    .input('RestaurantId', sql.NVarChar, restaurant_id)
                    .input('RestaurantName', sql.NVarChar, restaurant_name)
                    .input('FoodName', sql.NVarChar, food_name)
                    .input('FoodImage', sql.NVarChar, food_image)
                    .input('FoodPrice', sql.Float, food_price)
                    .query('insert into [Favorite]'
                    + ' (FBID,FoodId,RestaurantId,RestaurantName,FoodName,FoodImage,Price)'
                        +'values'
                        + '(@FBID,@FoodId,@RestaurantId,@RestaurantName,@FoodName,@FoodImage,@FoodPrice)');

                res.send(JSON.stringify({ success: true, message: "success" }));

            } catch (err) {
                console.log(err)
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }))
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "missing fbid in body of post request" }));
        }

    }




});

//delete favorite
router.delete('/favorite', async (req, res, next) => {
    console.log(req.query);
    if (req.query.key != API_KEY) {// body la dung cho lenh post , query dung cho lenh get
        res.send(JSON.stringify({ success: false, message: "wrong API key" }));
    }
    else {

        var fbid = req.query.fbid;
        var food_id = req.query.foodId;
        var restaurant_id = req.query.restaurantId;


        if (fbid != null) {

            try {

                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FBID', sql.NVarChar, fbid)
                    .input('FoodId', sql.Int, food_id)
                    .input('RestaurantId', sql.NVarChar, restaurant_id)
                    .query('delete  from [Favorite] where FBID=@FBID and FoodId=@FoodId and RestaurantId=@RestaurantId ');

                res.send(JSON.stringify({ success: true, message: "success" }));

            } catch (err) {
                console.log(err)
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }))
            }

        } else {
            res.send(JSON.stringify({ success: false, message: "missing fbid in body of post request" }));
        }

    }




});


module.exports = router;