package tools
import (
	"os"
	"log"
	"io"
	"mime/multipart"
	"container/list"
	"io/ioutil"
	"time"
	"strings"
	"strconv"
	"errors"
	"bufio"
	"math/rand"
)

func SaveBinFile2Disk(srcFile []byte, destDir string, fileName string) error  {
	//Create new file
	fileAbsName := destDir + fileName

	// write the whole body at once
	err := ioutil.WriteFile(fileAbsName, srcFile, 0644)
	if err != nil {
		log.Println("-- create file failed:", err)
		return err
	}
	return nil
}

func SaveMultipartFile2Disk(srcFile multipart.File, destDir string, fileName string) error  {
	if(srcFile == nil){
		return errors.New("cannot save an empty file")
	}

	//Create new file
	fileAbsName := destDir + fileName
	newFile, err := os.Create(fileAbsName)
	if err != nil {
		log.Println("-- create file failed:", err)
		return err
	}

	//Save binary content into new file
	numOfBytes, err := io.Copy(newFile, srcFile)
	if err != nil {
		log.Println("-- save file err:", err)
		return err
	}
	log.Printf("-- saved %s, %d bytes  \n", fileAbsName, numOfBytes)
	defer newFile.Close()
	return nil
}

// GET ALL FILE NAMES IN THE FOLDER
func GetFileNames(dir string)  *list.List{
	names := list.New()
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		names.PushBack(file.Name())
		//log.Println(file.Name())
	}
	return names
}

// DELETE ALL IN A FOLDER
func DeleteDir(dir string)  error{
	tries := 1
	var err error
	log.Printf("cleaning temp dir... \n")
	for ;tries <= 20;tries++{
		err = os.RemoveAll(dir)
		if err != nil {
			//log.Printf("%d try, remove folder error \n", tries)
			time.Sleep(5*time.Second)
		}
	}
	if(err == nil){
		log.Printf("%s removed, cleaning completed \n", dir)
	}
	return err
}

// DELETE A FILE
func DeleteFile(filename string)  error{
	tries := 1
	var err error
	for ;tries <= 20;tries++{
		err = os.Remove(filename)
		if err != nil {
			//log.Printf("%d try, remove file error \n", tries)
			time.Sleep(10 * time.Second)
		}
	}
	if(err == nil){
		log.Println("%s removed \n", filename)
	}
	return err
}

//ZERO PADDING, return padding + "i" --> zeroPad(1, 4) = "0001"
func ZeroPad(input int, returnLen int) string{
	data:= strconv.Itoa(input)
	len := len(data)
	gap:= returnLen - len;
	if(gap < 1){
		return data;
	}
	data = strings.Repeat("0", gap) + data;
	return data
}


func ReadFile(tFile *os.File) (int, []byte, error) {
	mBuf, err := ioutil.ReadAll(tFile)

	if err != nil {
		return 0, nil, err
	} else {
		return len(mBuf), mBuf, nil
	}
}

// CREATE DIR FOR DATABASE FILES
func CreateDir(dir string) error{
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		err := os.MkdirAll(dir, 0711)
		if err != nil {
			log.Println(" -- error creating " +  dir)
			return err
		}
		log.Printf("-- created directory %s \n", dir)
	}else{
		log.Printf("-- %s is ready\n", dir)
	}
	return nil
}

func IsExist(file string) bool{
	//Check existence of the file/dir
	if _, err := os.Stat(file); os.IsNotExist(err) {
		return false
	}else{
		return true
	}
}

func GetBytes(filePath string) ([]byte, error) {
	file, err := os.Open(filePath)
	defer file.Close()
	if err != nil {
		//log.Println(err)
		return nil, err
	}

	fileInfo, _ := file.Stat()
	var size int64 = fileInfo.Size()
	bytes := make([]byte, size)

	// read file into bytes
	buffer := bufio.NewReader(file)
	_, err = buffer.Read(bytes)

	return bytes, nil
}


func IdGenerate(strlen int) string {
	rand.Seed(time.Now().UTC().UnixNano())
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	result := make([]byte, strlen)
	for i := 0; i < strlen; i++ {
		result[i] = chars[rand.Intn(len(chars))]
	}
	return string(result)
}