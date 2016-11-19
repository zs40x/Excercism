import Foundation

public class Year {
    
    private var calendarYear: Int
    
    init(calendarYear: Int) {
        self.calendarYear = calendarYear
    }
    
    public var isLeapYear: Bool {
        get {
            
            if(calendarYear % 400 == 0) { return true };
            
            if(calendarYear % 100 == 0) { return false };
            
            return calendarYear % 4 == 0;
        }
    }
}
