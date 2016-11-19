// Enter Solution Here

class HelloWorld {
    
    public static func hello(_ name: String? = nil) -> String {
        
        return "Hello, \(nameOrDefaultValue(name))!"
    }
    
    private static func nameOrDefaultValue(_ name: String?) -> String {
        
        return name ?? "World"
    }
}
