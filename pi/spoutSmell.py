import wiringpi
import time
import sys

servo_pin  = 18
motor1_pin = 23
motor2_pin = 24
SPI_CH = 0
READ_CH = 0

param = sys.argv
set_smell = param[1]
already_dgree = int(param[2])
set_dgree = int(param[3])

wiringpi.wiringPiSetupGpio()
wiringpi.pinMode( motor1_pin, 1 )
wiringpi.pinMode( motor2_pin, 1 )
wiringpi.pinMode( servo_pin, 2 )
wiringpi.pwmSetMode(0)
wiringpi.pwmSetRange(1024)
wiringpi.pwmSetClock(375)
wiringpi.wiringPiSPISetup( SPI_CH, 1000000 )

def motor_t(num):
    wiringpi.digitalWrite( motor1_pin, 0 )
    wiringpi.digitalWrite( motor2_pin, 1 )
    time.sleep(num)

def motor_f(num):
    wiringpi.digitalWrite( motor1_pin, 1 )
    wiringpi.digitalWrite( motor2_pin, 0 )
    time.sleep(num)

def motor_stop():
    wiringpi.digitalWrite( motor1_pin, 1 )
    wiringpi.digitalWrite( motor2_pin, 1 )

def motor_init():
    wiringpi.digitalWrite( motor1_pin, 0 )
    wiringpi.digitalWrite( motor2_pin, 0 )

def angle(a, b):
    move_deg = int( 81 + 41 / 90 * (a + b)*10 )
    wiringpi.pwmWrite( servo_pin, move_deg )
    time.sleep(1)
    init_deg = int( 81 + 41 / 90 * (-90) )
    wiringpi.pwmWrite( servo_pin, init_deg )

def rori(num):
    flag = 0
    while flag == 0:
        buffer = 0x6800 | ( 0x1800 * READ_CH )
        buffer = buffer.to_bytes( 2, byteorder='big' )
        wiringpi.wiringPiSPIDataRW( SPI_CH, buffer )
        ch0_value = (( buffer[0] * 256 + buffer[1] ) & 0x3ff) >> 4
        deg = ch0_value - num
        print (deg)
        if (deg < 1) and (deg > -1):
            motor_stop()
            flag = 1
        elif deg > 1:
            motor_t(0.01)
            motor_stop()
            #time.sleep(1)
            time.sleep(abs(int(1/deg)))
        else:
            motor_f(0.01)
            motor_stop()
            #time.sleep(1)
            time.sleep(abs(int(1/deg)))

def easter_egg():
    motor_t(0.5)
    motor_f(0.5)
    angle(0, 90)
    motor_t(1)
    motor_f(1)
    angle(0, -90)
    motor_t(2)
    motor_f(2)
    angle(0, 90)
    motor_t(3)
    motor_f(3)
    angle(0, -90)
    motor_t(4)
    motor_f(4)
    angle(0, 90)
    motor_t(5)
    motor_f(5)
    angle(0, -90)

if (set_dgree + already_dgree) < 10:
    if (set_smell == "X"):
        print("Happy easterEgg")
        motor_init()
        easter_egg()
        motor_stop()
        print("by easterEgg")
    elif (set_smell == "A"):
        motor_init()
        rori(8)
        motor_stop()
        angle(set_dgree, already_dgree)
        print("できた1")
    elif (set_smell == "B"):
        motor_init()
        rori(16)
        motor_stop()
        angle(set_dgree, already_dgree)
        print("できた2")
    elif (set_smell == "C"):
        motor_init()
        rori(24)
        motor_stop()
        angle(set_dgree, already_dgree)
        print("できた3")
    elif (set_smell == "D"):
        motor_init()
        rori(30)
        motor_stop()
        angle(set_dgree, already_dgree)
        print("できた4")
    elif (set_smell == "E"):
        motor_init()
        rori(36)
        motor_stop()
        angle(set_dgree, already_dgree)
        print("できた5")
    elif (set_smell == "F"):
        motor_init()
        rori(42)
        motor_stop()
        angle(set_dgree, already_dgree)
        print("できた6")
    elif (set_smell == "G"):
        motor_init()
        rori(52)
        motor_stop()
        angle(set_dgree, already_dgree)
        print("できた7")
    elif (set_smell == "H"):
        motor_init()
        rori(64)
        motor_stop()
        angle(set_dgree, already_dgree)
        print("できた8")
    else:
        print("できてない")
else:
    print("その角度は無理")